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
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
          Course modules
        </p>
        <h2 className="dashboard-panel-title mt-2 text-[2rem]">
          Each module opens its own materials workspace
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Use this list to shape the course flow first, then open a module when
          you are ready to add notes, links, and files inside it.
        </p>
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-slate-300/80 bg-white/75 px-6 py-8 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/55">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              No modules yet
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create the first module to start adding materials to this course.
            </p>
          </div>
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
