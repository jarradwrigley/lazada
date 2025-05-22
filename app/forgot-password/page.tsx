import { Suspense } from "react";
import { signIn } from "@/lib/auth";
import MobileLayout from "../components/MobileLayout";
import DesktopLayout from "../components/DesktopLayout";
import MobileLoginPage from "../components/_ui/(mobile)/Login";
import LoadingScreen from "../components/LoadingScreen";
import MobileForgotPasswordPage from "../components/_ui/(mobile)/ForgotPassword";


export default function ForgotPasswordPage() {
  return (
    <>
      <MobileLayout>
        <Suspense fallback={<LoadingScreen />}>
          <MobileForgotPasswordPage />
        </Suspense>
      </MobileLayout>

      <DesktopLayout>
        <h2>Desktop Forgot Password</h2>
      </DesktopLayout>
    </>
  );
}
