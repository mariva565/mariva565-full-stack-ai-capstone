import { NotFoundClient } from "@/components/not-found/not-found-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | StudyHub",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return <NotFoundClient />;
}
