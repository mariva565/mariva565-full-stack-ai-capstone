import { redirect } from "next/navigation";

import { CourseDetailsClientPage } from "../../../components/course/course-details-client-page";
import { getCourseDetailsData } from "../../../lib/course-details-data";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";

type CourseDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  await getRequestUserOrRedirect();

  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) {
    redirect("/dashboard");
  }

  const courseDetails = await getCourseDetailsData(courseId);
  if (!courseDetails) {
    redirect("/dashboard");
  }

  return <CourseDetailsClientPage key={courseDetails.course.id} initialData={courseDetails} />;
}
