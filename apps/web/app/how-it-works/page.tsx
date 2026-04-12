import type { Metadata } from "next";

import { HowItWorksPage } from "@/components/how-it-works/how-it-works-page";

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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How It Works | Study Hub",
  description: "Научи как работи платформата за организирано учене. Създавай курсове, модули и материали.",
  url: "https://studyhub.app/how-it-works",
  isPartOf: {
    "@type": "WebSite",
    name: "Study Hub",
    url: "https://studyhub.app",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HowItWorksPage />
    </>
  );
}
