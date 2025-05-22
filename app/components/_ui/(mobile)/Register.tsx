"use client";

import { ChevronLeft, Headset, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../../LoadingScreen";
import { Suspense, useState } from "react";
import React from "react";
import OTPInput from "react-otp-input";
import { useStore } from "@/store/store";
import { showSuccess } from "@/lib/toast";

function SignupForm(): any {
    const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Zustand store
  const { setLoading } = useStore();

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = "Verification code is required";
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = "Verification code must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      // Additional password strength validation
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        newErrors.password =
          "Password must contain uppercase, lowercase, and numbers";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call to send verification code for signup
  const sendSignupVerificationCode = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/send-register-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          email: errorData.message || "Failed to send verification code",
        });
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ email: "Network error. Please try again." });
      return false;
    }
  };

  // API call to verify signup code
  const verifySignupCode = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify-register-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: formData.verificationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          verificationCode: errorData.message || "Invalid verification code",
        });
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ verificationCode: "Network error. Please try again." });
      return false;
    }
  };

  // API call to complete signup
  const completeSignup = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: formData.verificationCode,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          password: errorData.message || "Failed to create account",
        });
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ password: "Network error. Please try again." });
      return false;
    }
  };

  const handleNext = async (): Promise<void> => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    }

    if (!isValid) return;

    setIsLoading(true);
    setLoading(true); // Set Zustand loading state

    try {
      if (currentStep === 1) {
        // Send verification code
        const success = await sendSignupVerificationCode();
        if (success) {
          setCurrentStep(2);
        }
      } else if (currentStep === 2) {
        // Verify code before proceeding to step 3
        const success = await verifySignupCode();
        if (success) {
          setCurrentStep(3);
        }
      } else if (currentStep === 3) {
        // Complete signup
        const success = await completeSignup();
        if (success) {

          // Redirect to login or dashboard with success message
          console.log("Account created successfully");
          // You might want to redirect or show success message
          showSuccess("Account created successfully! You can log in now.")
          router.push('/login')
        }
      }
    } finally {
      setIsLoading(false);
      setLoading(false); // Clear Zustand loading state
    }
  };

  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const resendCode = async (): Promise<void> => {
    setIsLoading(true);
    setLoading(true);

    try {
      await sendSignupVerificationCode();
      // Show success message or toast
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const renderStep1 = (): any => (
    <>
      <div className="mb-2">
        <p className="text-gray-600 text-sm mb-6">
          Enter your email address to get started. We'll send you a verification
          code to confirm your email.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange("email", e.target.value)
          }
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your email address"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>
    </>
  );

  const renderStep2 = (): any => (
    <>
      <div className="mb-2">
        <p className="text-gray-600 text-sm mb-6">
          We've sent a verification code to{" "}
          <span className="font-medium">{formData.email}</span>. Please enter
          the 6-digit code below to verify your email.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>

        <div className="w-full flex justify-center">
          <OTPInput
            value={formData.verificationCode}
            onChange={(otp: string) =>
              handleInputChange("verificationCode", otp)
            }
            numInputs={6}
            shouldAutoFocus={true}
            renderInput={(props: any) => <input {...props} />}
            inputStyle={{
              width: "40px",
              height: "48px",
              margin: "0 4px",
              fontSize: "18px",
              borderRadius: "8px",
              border: errors.verificationCode
                ? "2px solid #ef4444"
                : "1px solid #d1d5db",
              textAlign: "center",
              outline: "none",
            }}
          />
        </div>

        {errors.verificationCode && (
          <p className="mt-1 text-sm text-red-500">{errors.verificationCode}</p>
        )}

        <button
          onClick={resendCode}
          disabled={isLoading}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </>
  );

  const renderStep3 = (): any => (
    <>
      <div className="mb-2">
        <p className="text-gray-600 text-sm mb-6">
          Create a strong password for your account. Make sure it's at least 8
          characters long and includes uppercase, lowercase, and numbers.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("password", e.target.value)
              }
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Create your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="pt-20 px-4 pb-4 flex flex-col min-h-[100dvh] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back to previous step"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="text-3xl font-[600]">
              {currentStep === 1 && "Create Account"}
              {currentStep === 2 && "Verify Email"}
              {currentStep === 3 && "Set Password"}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div
          className="flex items-center mb-6"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={3}
        >
          {[1, 2, 3].map((step: number) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-12 h-1 mx-2 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? "bg-black" : "bg-gray-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Form content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Bottom button */}
      <div className="mt-6">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </div>
          ) : (
            <>
              {currentStep === 1 && "Send Code"}
              {currentStep === 2 && "Verify Email"}
              {currentStep === 3 && "Create Account"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface FormData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  email?: string;
  verificationCode?: string;
  password?: string;
  confirmPassword?: string;
}

export default function MobileRegisterPage(): any {
  const router = useRouter();
  const { isLoading } = useStore(); // Get loading state from Zustand

  return (
    <div className="min-h-[100dvh] relative bg-gray-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-gray-50 flex justify-between items-center py-4 px-4">
        <button
          className="active:opacity-50 transition-opacity"
          onClick={() => router.push("/login")}
          aria-label="Go back to login"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          className="active:opacity-50 transition-opacity"
          aria-label="Contact support"
        >
          <Headset size={24} />
        </button>
      </header>

      {/* Show loading screen when Zustand loading state is true */}
      {isLoading && <LoadingScreen />}

      <Suspense fallback={<LoadingScreen />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
