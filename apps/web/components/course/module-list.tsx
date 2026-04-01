import type { FormEvent } from "react";

import type { CourseMaterial } from "../../lib/course-materials";
import { ModuleSection, type MaterialDraft, type ModuleInfo } from "./module-section";

type ModuleListProps = {
  modules: ModuleInfo[];
  materialsByModule: Record<number, CourseMaterial[]>;
  activeMaterialFormModuleId: number | null;
  materialDraft: MaterialDraft;
  pinBusyMaterialId: number | null;
  favoriteMaterialIds: Set<number>;
  onToggleCreateForm: (moduleId: number) => void;
  onDraftChange: (field: keyof MaterialDraft, value: string) => void;
  onRenameModule: (moduleId: number, title: string) => Promise<boolean>;
  onSubmitMaterial: (moduleId: number, event: FormEvent) => void;
  onDeleteModule: (moduleId: number) => void;
  onTogglePin: (materialId: number, isPinned: boolean) => void;
};

export function ModuleList({
  modules,
  materialsByModule,
  activeMaterialFormModuleId,
  materialDraft,
  pinBusyMaterialId,
  favoriteMaterialIds,
  onToggleCreateForm,
  onDraftChange,
  onRenameModule,
  onSubmitMaterial,
  onDeleteModule,
  onTogglePin,
}: ModuleListProps) {
  return (
    <div className="mt-6 space-y-4">
      {modules.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          No modules yet. Create your first module to start adding materials.
        </p>
      )}

      {modules.map((moduleRow) => (
        <ModuleSection
          key={moduleRow.id}
          module={moduleRow}
          materials={materialsByModule[moduleRow.id] ?? []}
          showCreateForm={activeMaterialFormModuleId === moduleRow.id}
          draft={materialDraft}
          pinBusyMaterialId={pinBusyMaterialId}
          favoriteMaterialIds={favoriteMaterialIds}
          onToggleCreateForm={onToggleCreateForm}
          onDraftChange={onDraftChange}
          onRenameModule={onRenameModule}
          onSubmitMaterial={onSubmitMaterial}
          onDeleteModule={onDeleteModule}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}
