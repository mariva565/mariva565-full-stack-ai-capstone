import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | Study Hub",
  description:
    "Sign in to your Study Hub account to access your courses, materials, and AI study tools.",
  openGraph: {
    title: "Sign In | Study Hub",
    description:
      "Sign in to your Study Hub account to access your courses, materials, and AI study tools.",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <AuthLayout variant="login">
      <LoginForm />
    </AuthLayout>
  );
}
