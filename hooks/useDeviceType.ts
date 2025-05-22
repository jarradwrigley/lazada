"use client";

import { useState, useEffect } from "react";

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile =
        /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(
          userAgent
        );
      setIsMobile(mobile);
      setIsLoading(false);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isLoading };
}
