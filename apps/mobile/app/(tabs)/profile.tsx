import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ProfileTabScreen } from "../../components/profile-tab/profile-tab-screen";
import { useProfileTab } from "../../components/profile-tab/use-profile-tab";

export default function ProfileTabRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();
  const viewModel = useProfileTab();

  useEffect(() => {
    if (params.edit !== "1") {
      return;
    }
    if (viewModel.loading || !viewModel.profile || viewModel.editing) {
      return;
    }

    viewModel.startEditing();
    router.replace("/(tabs)/profile");
  }, [
    params.edit,
    viewModel.loading,
    viewModel.profile,
    viewModel.editing,
    viewModel.startEditing,
    router,
  ]);

  return <ProfileTabScreen viewModel={viewModel} />;
}
