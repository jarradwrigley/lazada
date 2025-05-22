"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Import your Lottie animation
import loadingAnimation from "@/public/animations/Animation1.json";
import { useStore } from "@/store/store";

export default function LoadingScreen() {
  const { isLoading, isHydrated, setHydrated, setLoading } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Mark store as hydrated after component mounts
    const timer = setTimeout(() => {
      setHydrated();

      // Set loading to false after hydration UNLESS we're on home page
      // Home page will manage its own loading state through fetchHomeData
      if (typeof window !== "undefined") {
        const isHomePage = window.location.pathname === "/";
        if (!isHomePage) {
          // For non-home pages, stop loading after hydration
          setLoading(false);
        }
      }
    }, 100);

    return () => {
      setIsMounted(false);
      clearTimeout(timer);
    };
  }, [setHydrated, setLoading]);

  // Don't render anything until mounted
  if (!isMounted) return null;

  // Show loading screen whenever isLoading is true OR store is not hydrated
  if (!isLoading && isHydrated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="rounded-lg bg-transparent p-6">
        <div className="w-64 h-64">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
        {/* <p className="mt-4 text-center text-gray-700 font-medium">Loading...</p> */}
      </div>
    </div>
  );
}
