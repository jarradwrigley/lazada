import { Suspense } from "react";
import { signIn } from "@/lib/auth";
import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";
import MobileLoginPage from "../components/_ui/(mobile)/Login";
import LoadingScreen from "../components/LoadingScreen";
import MobileForgotPasswordPage from "../components/_ui/(mobile)/ForgotPassword";
import MobileRegisterPage from "../components/_ui/(mobile)/Register";

export default function RegisterPage() {
  return (
    <>
      <MobileLayout>
        <Suspense fallback={<LoadingScreen />}>
          <MobileRegisterPage />
        </Suspense>
      </MobileLayout>

      <DesktopLayout>
        <h2>Desktop Register</h2>
      </DesktopLayout>
    </>
  );
}
