import { MascotEmptyState } from "../ui/mascot-empty-state";
import { ModuleSection, type ModuleInfo } from "./module-section";

type ModuleListProps = {
  modules: ModuleInfo[];
  movingModuleId: number | null;
  onUpdateModule: (moduleId: number, title: string, description: string) => Promise<boolean>;
  onDeleteModule: (moduleId: number) => void;
  onMoveModule: (moduleId: number, direction: "up" | "down") => void;
};

export function ModuleList({
  modules,
  movingModuleId,
  onUpdateModule,
  onDeleteModule,
  onMoveModule,
}: ModuleListProps) {
  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="dashboard-panel-title mt-2 text-[2rem]">
          Course Modules
        </h2>
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <MascotEmptyState
            message="Nothing here yet — shall we add the first module? 🚀"
            subMessage="Create a module to start adding learning materials."
          />
        ) : null}

        {modules.map((moduleRow, index) => (
          <ModuleSection
            key={moduleRow.id}
            module={moduleRow}
            isFirst={index === 0}
            isLast={index === modules.length - 1}
            moveBusy={movingModuleId === moduleRow.id}
            onUpdateModule={onUpdateModule}
            onDeleteModule={onDeleteModule}
            onMoveModule={onMoveModule}
          />
        ))}
      </div>
    </div>
  );
}
