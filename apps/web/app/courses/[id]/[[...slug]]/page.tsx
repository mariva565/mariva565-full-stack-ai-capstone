import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  const user = await getRequestUserOrRedirect();

  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) {
    notFound();
  }

  const courseDetails = await getCourseDetailsData(user, courseId);
  if (!courseDetails) {
    notFound();
  }

  return <CourseDetailsClientPage key={courseDetails.course.id} initialData={courseDetails} />;
}
