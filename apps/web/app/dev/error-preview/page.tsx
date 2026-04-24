import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "500 Error Preview | StudyHub",
  description: "Local-only preview route for the custom 500 error screen.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function isLocalHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  const normalizedHost = host.toLowerCase();
  return (
    normalizedHost === "localhost" ||
    normalizedHost.startsWith("localhost:") ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost.startsWith("127.0.0.1:") ||
    normalizedHost === "[::1]" ||
    normalizedHost.startsWith("[::1]:")
  );
}

export default async function ErrorPreviewPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!isLocalHost(host)) {
    notFound();
  }

  throw new Error("Intentional localhost-only preview for the custom 500 error screen.");
}
