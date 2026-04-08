import { useEffect, useState } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../lib/auth-context";
import { useToast } from "../../lib/toast-context";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { BrandedSpinner } from "../../components/branded-spinner";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { invalidateAuthMe, queryKeys } from "../../lib/query-keys";

type ProfileUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const data = await apiFetch<{ user: ProfileUser }>("/api/auth/me");
      return data.user;
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (nextName: string) => {
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
      setEditing(false);
      showToast("Profile updated!");
    },
  });

  useEffect(() => {
    if (profileQuery.data && !editing) {
      setEditName(profileQuery.data.name);
    }
  }, [profileQuery.data, editing]);

  const profile = profileQuery.data ?? null;
  const loading = profileQuery.isPending && !profile;
  const refreshing = profileQuery.isRefetching && !profileQuery.isPending;
  const error = profileQuery.error
    ? getUserFriendlyError(profileQuery.error, "Failed to load profile")
    : "";

  async function handleSave() {
    if (!editName.trim()) return;

    try {
      await saveProfileMutation.mutateAsync(editName.trim());
    } catch {
      // Error toast is handled in mutation callbacks.
    }
  }

  if (loading) {
    return <BrandedSpinner message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <RNText style={styles.errorText}>{error || "Not found"}</RNText>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            void profileQuery.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
        >
          <RNText style={styles.retryBtnText}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            void profileQuery.refetch();
          }}
          tintColor={COLORS.brandPrimary}
        />
      }
    >
      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatarCircle}>
          <RNText style={styles.avatarText}>{initials}</RNText>
        </View>
        <RNText style={styles.heroName}>{profile.name}</RNText>
        <View style={styles.heroBadge}>
          <RNText style={styles.heroBadgeText}>{profile.role}</RNText>
        </View>
      </LinearGradient>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.field}>
          <RNText style={styles.fieldLabel}>Email</RNText>
          <RNText style={styles.fieldValue}>{profile.email}</RNText>
        </View>

        <View style={styles.field}>
          <RNText style={styles.fieldLabel}>Name</RNText>
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
          ) : (
            <RNText style={styles.fieldValue}>{profile.name}</RNText>
          )}
        </View>

        <View style={styles.field}>
          <RNText style={styles.fieldLabel}>Member since</RNText>
          <RNText style={styles.fieldValue}>
            {new Date(profile.createdAt).toLocaleDateString()}
          </RNText>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <RNText style={styles.logoutBtnText}>Log out</RNText>
        </TouchableOpacity>

        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditing(false);
                setEditName(profile.name);
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel profile editing"
            >
              <RNText style={styles.cancelBtnText}>Cancel</RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saveProfileMutation.isPending && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saveProfileMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Save profile"
            >
              <LinearGradient
                colors={GRADIENTS.primaryAction}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <RNText style={styles.saveBtnText}>
                  {saveProfileMutation.isPending ? "Saving..." : "Save"}
                </RNText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <RNText style={styles.editBtnText}>Edit Profile</RNText>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: COLORS.brandPrimary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.textOnBrand,
    fontWeight: "600",
  },
  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textOnBrand,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textOnBrand,
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textOnBrand,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: COLORS.brandDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  editInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.brandPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceHighlight,
  },
  actions: {
    marginHorizontal: 16,
    gap: 12,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dangerText,
  },
  editBtn: {
    borderWidth: 2,
    borderColor: COLORS.brandPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.brandPrimary,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.borderMuted,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textOnBrand,
  },
});
