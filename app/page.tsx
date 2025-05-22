"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";
import MobileHomePage from "./components/_ui/(mobile)/Home";
import DesktopHomePage from "./components/_ui/(desktop)/Home";

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
  const { setLoading, isHydrated } = useStore();
  const { isMobile, isLoading } = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    // Only start the loading process after hydration
    if (isHydrated) {
      // Set loading to true first
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000); // Increased to 2 seconds for better visibility

      return () => clearTimeout(timer);
    }
  }, [setLoading, isHydrated]);

  return (
    <>
      <MobileLayout>
        <MobileHomePage />
      </MobileLayout>

      <DesktopLayout>
        <DesktopHomePage />
      </DesktopLayout>
    </>
  );
}
