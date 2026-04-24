import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Study Hub",
  description: "Choose a new password for your Study Hub account.",
  openGraph: {
    title: "Reset Password | Study Hub",
    description: "Choose a new password for your Study Hub account.",
    type: "website",
  },
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout variant="login">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
