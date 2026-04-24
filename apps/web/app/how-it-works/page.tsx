import type { Metadata } from "next";

import { HowItWorksPage } from "@/components/how-it-works/how-it-works-page";
import { getRequestUserOrNull } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "How It Works | Study Hub",
  description:
    "Study Hub — Learn how the platform works for organized studying. Create courses, modules, and materials.",
  openGraph: {
    title: "How It Works | Study Hub",
    description: "Learn how the platform works for organized studying. Create courses, modules, and materials.",
    type: "website",
  },
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How It Works | Study Hub",
  description: "Learn how the platform works for organized studying. Create courses, modules, and materials.",
  url: `${APP_URL}/how-it-works`,
  isPartOf: {
    "@type": "WebSite",
    name: "Study Hub",
    url: APP_URL,
  },
};

export default async function Page() {
  const user = await getRequestUserOrNull();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HowItWorksPage isAuthenticated={Boolean(user)} />
    </>
  );
}
