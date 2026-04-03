import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CourseDetailsClientPage } from "../../../../components/course/course-details-client-page";
import { getCourseDetailsData, getCourseSummaryById } from "../../../../lib/course-details-data";
import { getRequestUserOrRedirect } from "../../../../lib/server-auth";

type CourseDetailsPageProps = {
  params: Promise<{ id: string; slug?: string[] }>;
};

export async function generateMetadata({ params }: CourseDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) {
    return { title: "Course — StudyHub" };
  }

  const course = await getCourseSummaryById(courseId);
  return {
    title: course ? `${course.title} — StudyHub` : "Course — StudyHub",
  };
}

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
