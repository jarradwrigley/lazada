"use client";

import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";
import MobileDashboardPage from "../components/_ui/(mobile)/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <MobileLayout>
        <MobileDashboardPage />
      </MobileLayout>

      <DesktopLayout>
        <h2>🖥️ Desktop Dashboard</h2>
      </DesktopLayout>
    </>
  );
}
