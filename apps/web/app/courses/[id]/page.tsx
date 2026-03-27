import { ScreenPlaceholder } from "@/components/screen-placeholder";

type CourseDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  return (
    <ScreenPlaceholder
      title={`Course Details (${params.id})`}
      description="Placeholder for modules and materials inside a course."
    />
  );
}
