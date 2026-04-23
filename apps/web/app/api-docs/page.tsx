import type { Metadata } from "next";
import { ApiDocsPage } from "@/components/api-docs/api-docs-page";
import { getRequestUserOrNull } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "StudyHub API Docs",
  description: "Public API reference for StudyHub endpoints, auth flow, and representative JSON contracts.",
};

export default async function ApiDocsRoute() {
  const user = await getRequestUserOrNull();

  return <ApiDocsPage isAuthenticated={Boolean(user)} />;
}
