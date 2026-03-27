import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "../components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyHub v2",
  description: "Learning management system capstone",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
