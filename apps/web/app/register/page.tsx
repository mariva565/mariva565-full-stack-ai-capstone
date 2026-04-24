import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | Study Hub",
  description:
    "Create your Study Hub account to organize courses, share materials, and study with AI-powered tools.",
  openGraph: {
    title: "Create Account | Study Hub",
    description:
      "Create your Study Hub account to organize courses, share materials, and study with AI-powered tools.",
    type: "website",
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout variant="register">
      <RegisterForm />
    </AuthLayout>
  );
}
