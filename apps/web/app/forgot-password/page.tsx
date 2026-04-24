import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Study Hub",
  description:
    "Request a password reset link to regain access to your Study Hub account.",
  openGraph: {
    title: "Forgot Password | Study Hub",
    description:
      "Request a password reset link to regain access to your Study Hub account.",
    type: "website",
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout variant="login">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
