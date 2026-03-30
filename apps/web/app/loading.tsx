import { Spinner } from "../components/ui/spinner";

export default function GlobalLoading() {
  return (
    <Spinner
      centered
      label="Preparing your StudyHub workspace..."
      tips={[
        "Tip: Pin important materials so they are always one click away.",
        "Tip: Use Progress filters to focus only on today and next 7 days.",
        "Tip: Keep milestone titles short and action-oriented for clarity.",
      ]}
    />
  );
}
