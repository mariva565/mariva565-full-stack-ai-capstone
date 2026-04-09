import type { Material, Module, ModuleContext } from "../../../lib/studyhub-types";

export type ModuleResponse = {
  module: ModuleContext;
  course: {
    id: number;
    title: string;
    description: string | null;
  };
};

export type DeleteTarget = { type: "module" } | { type: "material"; material: Material };

export type DeleteModulePayload = {
  moduleId: number;
  courseId: number;
};

export type DeleteModuleRollback = {
  previousModuleContext?: ModuleResponse;
  previousModuleMaterials?: Material[];
  previousCourseModules?: Module[];
};

export type DeleteMaterialRollback = {
  previousMaterials: Material[];
};
