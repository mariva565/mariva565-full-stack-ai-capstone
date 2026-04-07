import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { apiFetch, ApiError } from "../lib/api";
import { BrandedSpinner } from "../components/branded-spinner";

type ProfileUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setError("");
      const data = await apiFetch<{ user: ProfileUser }>("/api/auth/me");
      setProfile(data.user);
      setEditName(data.user.name);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const data = await apiFetch<{ user: ProfileUser }>("/api/auth/me", {
        method: "PUT",
        body: { name: editName.trim() },
      });
      setProfile(data.user);
      setEditing(false);
      setSaveMsg("Profile updated!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to save";
      setSaveMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Profile" }} />
        <BrandedSpinner message="Loading profile..." />
      </>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Profile" }} />
        <Text style={styles.errorText}>{error || "Not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
          <Text style={styles.retryBtnText}>Retry</Text>
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
            setRefreshing(true);
            fetchProfile();
          }}
          tintColor="#4d33c4"
        />
      }
    >
      <Stack.Screen options={{ title: "Profile" }} />

      <LinearGradient
        colors={["#2e1d7a", "#4d33c4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{profile.role}</Text>
        </View>
      </LinearGradient>

      {saveMsg ? (
        <View style={[styles.msgBox, saveMsg.includes("updated") ? styles.msgSuccess : styles.msgError]}>
          <Text style={styles.msgText}>{saveMsg}</Text>
        </View>
      ) : null}

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{profile.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Member since</Text>
          <Text style={styles.fieldValue}>
            {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditing(false);
                setEditName(profile.name);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={["#4d33c4", "#7c5ce7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
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
    backgroundColor: "#f8f6ff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6ff",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#4d33c4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#ffffff",
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
    color: "#ffffff",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
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
    color: "#ffffff",
    textTransform: "capitalize",
  },
  msgBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  msgSuccess: {
    backgroundColor: "#dcfce7",
  },
  msgError: {
    backgroundColor: "#fef2f2",
  },
  msgText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#334155",
  },
  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: "#2e1d7a",
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
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  editInput: {
    fontSize: 16,
    color: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#4d33c4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#faf9ff",
  },
  actions: {
    marginHorizontal: 16,
  },
  editBtn: {
    borderWidth: 2,
    borderColor: "#4d33c4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4d33c4",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
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
    color: "#ffffff",
  },
});
