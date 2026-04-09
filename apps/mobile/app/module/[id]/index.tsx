import { useLocalSearchParams } from "expo-router";

import { ModuleWorkspaceScreen } from "../../../components/module-workspace/module-workspace-screen";
import { useModuleWorkspace } from "../../../components/module-workspace/use-module-workspace";

export default function ModuleWorkspaceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const viewModel = useModuleWorkspace(String(id));

  return <ModuleWorkspaceScreen viewModel={viewModel} />;
}
