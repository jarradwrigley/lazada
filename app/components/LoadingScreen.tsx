"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Import your Lottie animation
import loadingAnimation from "@/public/animations/Animation1.json";
import { useStore } from "@/store/store";

interface LoadingScreenProps {
  show?: boolean;
  message?: string;
}

export default function LoadingScreen({
  show,
  message,
}: LoadingScreenProps = {}) {
  const { isHydrated, setHydrated } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Mark store as hydrated after component mounts
    const timer = setTimeout(() => {
      setHydrated();
    }, 100);

    return () => {
      setIsMounted(false);
      clearTimeout(timer);
    };
  }, [setHydrated]);

  // Don't render anything until mounted
  if (!isMounted) return null;

  // If show prop is provided, use that; otherwise check hydration status
  const shouldShow = show !== undefined ? show : !isHydrated;

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="rounded-lg bg-transparent p-6">
        <div className="w-64 h-64">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
