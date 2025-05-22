"use client";

import { ChevronLeft, Headset, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../../LoadingScreen";
import { Suspense, useState } from "react";
import React from "react";
import OTPInput from "react-otp-input";
import { useStore } from "@/store/store";

function ForgotPasswordForm(): any {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: "",
    verificationCode: "",
    newPassword: "",
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
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number is required";
    } else {
      // Basic email or phone validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (
        !emailRegex.test(formData.emailOrPhone) &&
        !phoneRegex.test(formData.emailOrPhone)
      ) {
        newErrors.emailOrPhone = "Please enter a valid email or phone number";
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
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call to send verification code
  const sendVerificationCode = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          emailOrPhone: errorData.message || "Failed to send verification code",
        });
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ emailOrPhone: "Network error. Please try again." });
      return false;
    }
  };

  // API call to verify code
  const verifyCode = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
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

  // API call to reset password
  const resetPassword = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          verificationCode: formData.verificationCode,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          newPassword: errorData.message || "Failed to reset password",
        });
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ newPassword: "Network error. Please try again." });
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
        const success = await sendVerificationCode();
        if (success) {
          setCurrentStep(2);
        }
      } else if (currentStep === 2) {
        // Verify code before proceeding to step 3
        const success = await verifyCode();
        if (success) {
          setCurrentStep(3);
        }
      } else if (currentStep === 3) {
        // Reset password
        const success = await resetPassword();
        if (success) {
          // Redirect to login with success message
          console.log("Password reset successful");
          // You might want to redirect or show success message
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
      await sendVerificationCode();
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
          Enter your email address or phone number and we'll send you a
          verification code to reset your password.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email or Phone Number
        </label>
        <input
          type="text"
          value={formData.emailOrPhone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange("emailOrPhone", e.target.value)
          }
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black ${
            errors.emailOrPhone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter email or phone number"
          autoComplete="email"
        />
        {errors.emailOrPhone && (
          <p className="mt-1 text-sm text-red-500">{errors.emailOrPhone}</p>
        )}
      </div>
    </>
  );

  const renderStep2 = (): any => (
    <>
      <div className="mb-2">
        <p className="text-gray-600 text-sm mb-6">
          We've sent a verification code to{" "}
          <span className="font-medium">{formData.emailOrPhone}</span>. Please
          enter the 6-digit code below.
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
          Choose a strong password for your account. Make sure it's at least 8
          characters long.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("newPassword", e.target.value)
              }
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter new password"
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
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
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
              placeholder="Confirm new password"
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
              {currentStep === 1 && "Forgot Password"}
              {currentStep === 2 && "Verify Code"}
              {currentStep === 3 && "New Password"}
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
              {currentStep === 2 && "Verify Code"}
              {currentStep === 3 && "Reset Password"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface FormData {
  emailOrPhone: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  emailOrPhone?: string;
  verificationCode?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function MobileForgotPasswordPage(): any {
  const router = useRouter();
  const { isLoading } = useStore(); // Get loading state from Zustand

  return (
    <div className="min-h-[100dvh] relative bg-gray-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-gray-50 border-b border-gray-200 flex justify-between items-center py-4 px-4">
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
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
