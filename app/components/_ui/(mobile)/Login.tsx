"use client";

import { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Headset, Eye, EyeOff, Loader2 } from "lucide-react";
import {  useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useStore } from "@/store/store";
import { showError, showSuccess } from "@/lib/toast";
import LoadingScreen from "../../LoadingScreen";

// Separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // Store state
  const { login, isLoading, error, clearError, setLoading } = useStore();

  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Clear errors when component mounts or when inputs change
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (email || password) {
      setFormErrors({});
    }
  }, [email, password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    // Email/Phone validation
    if (!email.trim()) {
      errors.email = "Email or phone number is required";
    } else if (email.includes("@")) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    } else {
      // Phone validation (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(email.replace(/\s+/g, ""))) {
        errors.email = "Please enter a valid phone number";
      }
    }

    // Password validation
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: returnUrl,
        redirect: false,
      });

      if (result?.error) {
        showError("Google login failed");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      showError("Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const isFormValid =
    email.trim() && password.trim() && Object.keys(formErrors).length === 0;
  const isSubmitting = isLoading || isGoogleLoading;

  return (
    <div className="pt-14 px-4 pb-4 flex flex-col min-h-[100dvh] justify-between overflow-y-auto">
      <div className="flex flex-col gap-4">
        <span className="mb-4 text-3xl font-[600]">Hi, welcome back!</span>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="font-[700] text-lg">Email/Phone number</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className={`px-[1rem] py-[0.5rem] focus:outline-1 text-[16px] text-[#0a0a0a] bg-gray-100 rounded-[12px] placeholder-gray-400 disabled:opacity-50 ${
                formErrors.email
                  ? "focus:outline-red-500 border border-red-300"
                  : "focus:outline-black"
              }`}
              placeholder="Enter email or phone number"
            />
            {formErrors.email && (
              <span className="text-red-500 text-sm">{formErrors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[700] text-lg">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-[1rem] py-[0.5rem] pr-12 focus:outline-1 text-[16px] text-[#0a0a0a] bg-gray-100 rounded-[12px] placeholder-gray-400 disabled:opacity-50 ${
                  formErrors.password
                    ? "focus:outline-red-500 border border-red-300"
                    : "focus:outline-black"
                }`}
                placeholder="Enter your password"
              />
              {password && (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 active:opacity-50 transition-opacity focus:outline-none disabled:opacity-30"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
            {formErrors.password && (
              <span className="text-red-500 text-sm">
                {formErrors.password}
              </span>
            )}
          </div>

          {/* Global error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Forgot password link */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSubmitting}
              className="text-md active:scale-102 hover:text-blue-800 active:opacity-50 transition-opacity disabled:opacity-50"
            >
              Forgot your password?
            </button>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="mt-4 active:scale-102 w-full bg-black text-white py-2 rounded-[12px] font-[600] text-lg active:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={isSubmitting}
              className="mt-4 active:scale-102 border border-transparent w-full bg-transparent text-black py-2 rounded-[12px] font-[600] text-lg active:opacity-80 transition-opacity disabled:opacity-50"
            >
              Sign up now
            </button>
          </div>
        </form>
      </div>

      <div className=" px-4 w-full flex flex-col justify-center gap-4">
        <div className="flex items-center justify-between">
          <div className="w-[40%] h-[0.1rem] bg-gray-200" />
          <span className="text-gray-400 text-xs">Other</span>
          <div className="w-[40%] h-[0.1rem] bg-gray-200" />
        </div>

        <div className="w-full ">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-[100%] active:scale-102 flex items-center justify-center gap-3 bg-transparent border border-gray-300 text-black py-3 rounded-[12px] font-[600] text-lg active:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Image
                  src="/images/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Header component that doesn't use useSearchParams
function LoginHeader() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-gray-50 flex justify-between items-center py-2 px-4">
      <button
        className="active:opacity-50 transition-opacity"
        onClick={() => router.push("/")}
      >
        <ChevronLeft size={24} />
      </button>

      <button className="active:opacity-50 transition-opacity">
        <Headset size={24} />
      </button>
    </header>
  );
}

// Main component that wraps the form with Suspense
export default function MobileLoginPage() {
  return (
    <div className="min-h-[100dvh] relative bg-gray-50">
      <LoginHeader />
      <Suspense
        fallback={
          <LoadingScreen />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
