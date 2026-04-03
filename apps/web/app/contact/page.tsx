"use client";

import { ContactConstellation } from "../../components/contact/contact-constellation";
import { ContactAurora } from "../../components/contact/contact-aurora";
import { ContactHeader } from "../../components/contact/contact-header";
import { ContactForm } from "../../components/contact/contact-form";

export default function ContactPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0f0a1f 50%, #0a1a2e 75%, #0a0a1a 100%)",
        backgroundSize: "400% 400%",
        animation: "cosmic-gradient 20s ease infinite",
      }}
    >
      <ContactConstellation />
      <ContactAurora />
      <ContactHeader />
      <ContactForm />
    </div>
  );
}
