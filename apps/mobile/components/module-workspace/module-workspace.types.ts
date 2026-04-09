import type { MaterialType } from "../../lib/material-utils";
import type { Material, Module, ModuleContext } from "../../lib/studyhub-types";

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

export type ModuleWorkspaceViewModel = {
  routeId: string;
  context: ModuleResponse | null;
  materials: Material[];
  filteredMaterials: Material[];
  searchQuery: string;
  typeFilter: MaterialType | null;
  hasFilters: boolean;
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  loading: boolean;
  refreshing: boolean;
  error: string;
  setSearchQuery: (value: string) => void;
  setTypeFilter: (value: MaterialType | null) => void;
  retry: () => void;
  refresh: () => void;
  openCourse: () => void;
  editModule: () => void;
  openDeleteModule: () => void;
  addMaterial: () => void;
  openMaterial: (materialId: number) => void;
  editMaterial: (materialId: number) => void;
  isMaterialPinned: (materialId: number) => boolean;
  isFavoriteBusy: (materialId: number) => boolean;
  toggleMaterialFavorite: (material: Material) => void;
  openDeleteMaterial: (material: Material) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
};
