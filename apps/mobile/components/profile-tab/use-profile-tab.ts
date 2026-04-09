import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { useAuth } from "../../lib/auth-context";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { invalidateAuthMe, queryKeys } from "../../lib/query-keys";
import { useToast } from "../../lib/toast-context";
import type { ProfileTabViewModel, ProfileUser } from "./profile-tab.types";

type SaveProfileRollback = { previousProfile?: ProfileUser };
type SaveProfileMutation = UseMutationResult<
  ProfileUser,
  unknown,
  string,
  SaveProfileRollback
>;

function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const data = await apiFetch<{ user: ProfileUser }>("/api/auth/me", { cache: false });
      return data.user;
    },
  });
}

function useSaveProfileMutation(
  queryClient: QueryClient,
  showToast: ReturnType<typeof useToast>["showToast"]
): SaveProfileMutation {
  return useMutation<ProfileUser, unknown, string, SaveProfileRollback>({
    mutationFn: async (nextName) => {
      const data = await apiFetch<{ user: ProfileUser }>("/api/auth/me", {
        method: "PUT",
        body: { name: nextName },
      });
      return data.user;
    },
    onMutate: async (nextName) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.me() });
      const previousProfile = queryClient.getQueryData<ProfileUser>(queryKeys.auth.me());

      if (previousProfile) {
        queryClient.setQueryData<ProfileUser>(queryKeys.auth.me(), {
          ...previousProfile,
          name: nextName,
        });
      }
      return { previousProfile };
    },
    onError: (error, _nextName, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.auth.me(), context.previousProfile);
      }
      showToast(getUserFriendlyError(error, "Failed to save"), "error");
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      await invalidateAuthMe(queryClient);
      showToast("Profile updated!");
    },
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function useProfileEditor(
  profileName: string | undefined,
  saveProfileMutation: SaveProfileMutation
) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!editing) {
      setEditName(profileName ?? "");
    }
  }, [editing, profileName]);

  const startEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setEditName(profileName ?? "");
  }, [profileName]);

  const saveProfile = useCallback(() => {
    const nextName = editName.trim();
    if (!nextName) {
      return;
    }
    void saveProfileMutation
      .mutateAsync(nextName)
      .then(() => setEditing(false))
      .catch(() => {
        // Error toast is handled in mutation callbacks.
      });
  }, [editName, saveProfileMutation]);

  return { editing, editName, setEditName, startEditing, cancelEditing, saveProfile };
}

export function useProfileTab(): ProfileTabViewModel {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const profileQuery = useProfileQuery();
  const saveProfileMutation = useSaveProfileMutation(queryClient, showToast);

  const profile = profileQuery.data ?? null;
  const loading = profileQuery.isPending && !profile;
  const refreshing = profileQuery.isRefetching && !profileQuery.isPending;
  const error = profileQuery.error
    ? getUserFriendlyError(profileQuery.error, "Failed to load profile")
    : "";
  const initials = useMemo(() => getInitials(profile?.name ?? ""), [profile?.name]);
  const editor = useProfileEditor(profile?.name, saveProfileMutation);

  const refresh = useCallback(() => {
    void profileQuery.refetch();
  }, [profileQuery]);

  return {
    profile,
    initials,
    editName: editor.editName,
    editing: editor.editing,
    loading,
    refreshing,
    error,
    saving: saveProfileMutation.isPending,
    retry: refresh,
    refresh,
    setEditName: editor.setEditName,
    startEditing: editor.startEditing,
    cancelEditing: editor.cancelEditing,
    saveProfile: editor.saveProfile,
    logout,
  };
}
