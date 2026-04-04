import type { Metadata } from "next";

import { HowItWorksPage } from "@/components/how-it-works/how-it-works-page";

export const metadata: Metadata = {
  title: "How It Works | Study Hub",
  description:
    "Study Hub | Научи как работи платформата за организирано учене. Създавай курсове, модули и материали.",
};

export default function Page() {
  return <HowItWorksPage />;
}
