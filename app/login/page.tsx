import { signIn } from "@/lib/auth";
import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";
// import MobileLayout from "@/components/MobileLayout";
// import DesktopLayout from "@/components/DesktopLayout";

function LoginContent() {
  return (
    <div>
      <h1>Login Page</h1>
      <p>Please sign in to continue</p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <MobileLayout>
        <div className="mobile-only">
          <h2>Mobile Login</h2>
          <LoginContent />
        </div>
      </MobileLayout>

      <DesktopLayout>
        <div className="desktop-only">
          <h2>Desktop Login</h2>
          <LoginContent />
        </div>
      </DesktopLayout>
    </>
  );
}
