"use client";

import { ContactConstellation } from "../../components/contact/contact-constellation";
import { ContactAurora } from "../../components/contact/contact-aurora";
import { ContactHeader } from "../../components/contact/contact-header";
import { ContactForm } from "../../components/contact/contact-form";

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
