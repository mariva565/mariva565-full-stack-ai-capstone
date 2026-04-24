import type { Metadata } from "next";

import { ContactConstellation } from "../../components/contact/contact-constellation";
import { ContactAurora } from "../../components/contact/contact-aurora";
import { ContactHeader } from "../../components/contact/contact-header";
import { ContactForm } from "../../components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Study Hub",
  description:
    "Get in touch with the Study Hub team. Send us feedback, questions, or partnership inquiries.",
  openGraph: {
    title: "Contact Us | Study Hub",
    description:
      "Get in touch with the Study Hub team. Send us feedback, questions, or partnership inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="contact-bg relative min-h-screen overflow-hidden font-sans">
      <ContactConstellation />
      <ContactAurora />
      <ContactHeader />
      <ContactForm />
    </div>
  );
}
