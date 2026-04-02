import { Spinner } from "../components/ui/spinner";

export default function GlobalLoading() {
  return (
    <Spinner
      centered
      label="Loading StudyHub..."
      hint="Preparing your workspace and recent content."
    />
  );
}
