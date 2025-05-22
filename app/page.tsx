"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== "undefined") {
        const userAgent = navigator.userAgent;
        const mobile =
          /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(
            userAgent
          );
        setIsMobile(mobile);
        setIsLoading(false);
      }
    };

    checkDevice();
  }, []);

  return { isMobile, isLoading };
}

export default function HomePage() {
  const { isMobile, isLoading } = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Always redirect to dashboard since auth middleware handles login redirect
      router.push("/dashboard");
    }
  }, [isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Redirecting...</h1>
      <p>Device: {isMobile ? "Mobile" : "Desktop"}</p>
    </div>
  );
}
