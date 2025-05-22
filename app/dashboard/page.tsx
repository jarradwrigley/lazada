import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";

async function DashboardContent() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name || "User"}!</p>
      <p>Email: {session.user?.email}</p>

      <div style={{ marginTop: "20px" }}>
        <h3>Dashboard Stats:</h3>
        <ul>
          <li>Total Users: 1,247</li>
          <li>Revenue: $12,426</li>
          <li>Growth: +14.2%</li>
        </ul>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        style={{ marginTop: "30px" }}
      >
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <MobileLayout>
        <div className="mobile-only">
          <h2>📱 Mobile Dashboard</h2>
          <DashboardContent />
        </div>
      </MobileLayout>

      <DesktopLayout>
        <div className="desktop-only">
          <h2>🖥️ Desktop Dashboard</h2>
          <DashboardContent />
        </div>
      </DesktopLayout>
    </>
  );
}
