import { ForbiddenClient } from "@/components/forbidden/forbidden-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Restricted (403) | StudyHub",
  description: "You do not have permission to view this page.",
};

export default function ForbiddenPage() {
  return <ForbiddenClient />;
}
