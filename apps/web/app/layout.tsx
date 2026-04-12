import { Rubik, Shantell_Sans } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeScript } from "@/components/theme/theme-script";
import { Navbar } from "@/components/navbar";
import { ChatGate } from "@/components/chat/chat-gate";
import { Providers } from "@/components/providers";
import { PageEnterEffect } from "@/components/ui/page-enter-effect";
import "./globals.css";

const shantellSans = Shantell_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-shantell",
});

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Study Hub | Master Your Learning Journey",
  description: "The ultimate platform for students and educators to organize courses and materials.",
  icons: {
    icon: "/assets/v1/favicon.png",
    shortcut: "/assets/v1/favicon.png",
    apple: "/assets/v1/apple-touch-icon.png",
  },
  openGraph: {
    title: "Study Hub | Master Your Learning Journey",
    description: "The ultimate platform for students and educators to organize courses and materials.",
    type: "website",
    siteName: "Study Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Hub | Master Your Learning Journey",
    description: "The ultimate platform for students and educators to organize courses and materials.",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} ${shantellSans.variable}`}
    >
      <body className="min-h-screen bg-white font-rubik text-slate-900 antialiased selection:bg-primary-100 selection:text-primary-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeScript />
        <Providers>
          <Navbar />
          <PageEnterEffect>
            {children}
          </PageEnterEffect>
          <ChatGate />
        </Providers>
      </body>
    </html>
  );
}
