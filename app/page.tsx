"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";
import MobileHomePage from "./components/_ui/(mobile)/Home";
import DesktopHomePage from "./components/_ui/(desktop)/Home";
import LoadingScreen from "./components/LoadingScreen"; // Your loading component

export default function HomePage() {
  const { fetchHomeData, isLoading } = useStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (!hasInitialized) {
        console.log("[HomePage] Initializing data fetch...");
        await fetchHomeData();
        setHasInitialized(true);
      }
    };

    initializeData();
  }, [fetchHomeData, hasInitialized]);

  // Show loading screen while data is being fetched initially
  if (isLoading && !hasInitialized) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  // Main content
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
