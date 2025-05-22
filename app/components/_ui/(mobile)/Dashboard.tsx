import { signOut } from "next-auth/react";

export default function MobileDashboardPage() {
  const handleLogout = async () => {
    await signOut({
      redirect: true,
      redirectTo: "/login",
    });
  };
  return (
    <div>
      Mobile Dash
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
