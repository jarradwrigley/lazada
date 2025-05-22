"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import LoadingScreen from "./components/LoadingScreen";
import LayoutWrapper from "./components/layout/LayoutWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem defaultTheme="system">
        <LayoutWrapper>
          <LoadingScreen />

          {children}
        </LayoutWrapper>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </SessionProvider>
  );
}
