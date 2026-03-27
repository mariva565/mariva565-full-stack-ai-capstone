import { ScreenPlaceholder } from "@/components/screen-placeholder";

type MaterialPageProps = {
  params: {
    id: string;
  };
};

export default function MaterialPage({ params }: MaterialPageProps) {
  return (
    <ScreenPlaceholder
      title={`Material View/Edit (${params.id})`}
      description="Placeholder for viewing and editing a learning material."
    />
  );
}
