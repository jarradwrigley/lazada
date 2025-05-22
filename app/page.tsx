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
  const { setLoading } = useStore();
  const { isMobile, isLoading } = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <>
      <MobileLayout>
        {/* <div className="mobile-only"> */}
        <MobileHomePage />
        {/* <LoginContent /> */}
        {/* </div> */}
      </MobileLayout>

      <DesktopLayout>
        {/* <div className="desktop-only"> */}
        <DesktopHomePage />
        {/* <LoginContent /> */}
        {/* </div> */}
      </DesktopLayout>
    </>
  );
}
