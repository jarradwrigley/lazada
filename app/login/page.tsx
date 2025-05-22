import { Suspense } from "react";
import { signIn } from "@/lib/auth";
import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";
import MobileLoginPage from "../components/_ui/(mobile)/Login";
import LoadingScreen from "../components/LoadingScreen";

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
        <Suspense fallback={<LoadingScreen />}>
          <MobileLoginPage />
        </Suspense>
      </MobileLayout>

      <DesktopLayout>
        <h2>Desktop Login</h2>
        <LoginContent />
      </DesktopLayout>
    </>
  );
}
