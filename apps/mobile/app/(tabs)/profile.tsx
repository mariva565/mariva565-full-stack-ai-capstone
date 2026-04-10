import { useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ProfileTabScreen } from "../../components/profile-tab/profile-tab-screen";
import { useProfileTab } from "../../components/profile-tab/use-profile-tab";
import { useToast } from "../../lib/toast-context";

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }
  return (value ?? "").trim();
}

export default function ProfileTabRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string | string[]; handoffUserId?: string | string[] }>();
  const { showToast } = useToast();
  const viewModel = useProfileTab();
  const processedHandoffRef = useRef<string | null>(null);

  const editParam = normalizeParam(params.edit);
  const handoffUserId = normalizeParam(params.handoffUserId);

  useEffect(() => {
    if (editParam !== "1") {
      return;
    }
    if (viewModel.loading || !viewModel.profile || viewModel.editing) {
      return;
    }

    viewModel.startEditing();
    router.replace("/(tabs)/profile");
  }, [
    editParam,
    viewModel.loading,
    viewModel.profile,
    viewModel.editing,
    viewModel.startEditing,
    router,
  ]);

  useEffect(() => {
    if (!handoffUserId) {
      return;
    }
    if (processedHandoffRef.current === handoffUserId) {
      return;
    }
    if (viewModel.loading || !viewModel.profile) {
      return;
    }

    processedHandoffRef.current = handoffUserId;

    if (!/^\d+$/.test(handoffUserId)) {
      showToast("Invalid profile deep link. Opened your profile instead.", "info");
      router.replace("/(tabs)/profile");
      return;
    }

    const scannedUserId = Number(handoffUserId);
    if (scannedUserId === viewModel.profile.id) {
      showToast("Profile deep link opened successfully.", "info");
    } else {
      showToast(`Opened profile link for user #${scannedUserId}.`, "info");
    }

    router.replace("/(tabs)/profile");
  }, [handoffUserId, viewModel.loading, viewModel.profile, showToast, router]);

  return <ProfileTabScreen viewModel={viewModel} />;
}
