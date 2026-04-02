import { ProgressPageClient } from "../../components/progress/progress-page-client";
import { getProgressData } from "../../lib/progress-data";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

export default async function ProgressPage() {
  const user = await getRequestUserOrRedirect();
  const progressData = await getProgressData(user.sub);

  return <ProgressPageClient initialData={progressData} />;
}
