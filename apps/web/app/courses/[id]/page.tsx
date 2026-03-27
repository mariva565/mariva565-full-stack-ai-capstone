import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { use } from "react";

type CourseDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { id } = use(params);
  return (
    <ScreenPlaceholder
      title={`Course Details (${id})`}
      description="Placeholder for modules and materials inside a course."
    />
  );
}
