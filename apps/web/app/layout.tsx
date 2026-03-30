import { Rubik, Shantell_Sans, Poppins } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const shantellSans = Shantell_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-shantell",
});

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${rubik.variable} ${shantellSans.variable} ${poppins.variable}`}>
      <body className="font-rubik antialiased min-h-screen transition-colors duration-300 bg-white text-slate-900 selection:bg-primary-100 selection:text-primary-900">
        {children}
      </body>
    </html>
  );
}
