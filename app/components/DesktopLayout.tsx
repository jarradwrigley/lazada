"use client";

import { ReactNode } from "react";

interface DesktopLayoutProps {
  children: ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="desktop-layout desktop-only">
      <div
        style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "15px",
          marginBottom: "30px",
          borderRadius: "8px",
        }}
      >
        🖥️ Desktop View
      </div>
      {children}
    </div>
  );
}
