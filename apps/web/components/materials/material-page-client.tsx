"use client";

import { MaterialPageShell } from "./material-page-shell";
import { useMaterialPageController } from "./material-page-controller";
import type { MaterialPageData } from "./types";

type MaterialPageClientProps = {
  initialData: MaterialPageData;
  initialEditing?: boolean;
};

export function MaterialPageClient({
  initialData,
  initialEditing = false,
}: MaterialPageClientProps) {
  const controller = useMaterialPageController({ initialData, initialEditing });

  return <MaterialPageShell controller={controller} />;
}
