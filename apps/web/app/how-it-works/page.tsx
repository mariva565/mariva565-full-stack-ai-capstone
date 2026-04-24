import type { Metadata } from "next";

import { HowItWorksPage } from "@/components/how-it-works/how-it-works-page";
import { getRequestUserOrNull } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "How It Works | Study Hub",
  description:
    "Study Hub | Научи как работи платформата за организирано учене. Създавай курсове, модули и материали.",
  openGraph: {
    title: "How It Works | Study Hub",
    description: "Научи как работи платформата за организирано учене. Създавай курсове, модули и материали.",
    type: "website",
  },
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How It Works | Study Hub",
  description: "Научи как работи платформата за организирано учене. Създавай курсове, модули и материали.",
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
