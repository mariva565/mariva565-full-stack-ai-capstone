import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { use } from "react";

type MaterialPageProps = {
  params: Promise<{ id: string }>;
};

export default function MaterialPage({ params }: MaterialPageProps) {
  const { id } = use(params);
  return (
    <ScreenPlaceholder
      title={`Material View/Edit (${id})`}
      description="Placeholder for viewing and editing a learning material."
    />
  );
}
