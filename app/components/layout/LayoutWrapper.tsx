"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthenticatedLayout from "./AuthenticatedLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Define which routes should show the bottom navbar
const authenticatedRoutes = [
  "/dashboard",
  "/search",
  "/notifications",
  "/profile",
  "/settings",
];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check if current route should show authenticated layout
  const shouldShowAuthLayout = authenticatedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on authenticated route and user is authenticated, show navbar layout
  if (shouldShowAuthLayout && status === "authenticated") {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Otherwise, render children without navbar
  return <>{children}</>;
}
