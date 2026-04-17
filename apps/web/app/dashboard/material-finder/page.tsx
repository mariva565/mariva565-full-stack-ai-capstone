import type { Metadata } from "next";

import { MaterialFinderClient } from "../../../components/material-finder/material-finder-client";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";

export const metadata: Metadata = {
  title: "Material Finder — StudyHub",
};

export default async function MaterialFinderPage() {
  const user = await getRequestUserOrRedirect();
  const userName = user.email.split("@")[0] || "there";
  return <MaterialFinderClient userName={userName} />;
}
