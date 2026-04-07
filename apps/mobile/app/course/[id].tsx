import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
  LayoutAnimation,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { apiFetch } from "../../lib/api";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

type Module = {
  id: number;
  title: string;
  orderIndex: number;
};

type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  note: { icon: "N", color: "#7c5ce7", bg: "#f0ecff" },
  link: { icon: "L", color: "#0ea5e9", bg: "#e0f2fe" },
  file: { icon: "F", color: "#f59e0b", bg: "#fef3c7" },
  video: { icon: "V", color: "#ef4444", bg: "#fef2f2" },
};

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [materialsByModule, setMaterialsByModule] = useState<
    Record<number, Material[]>
  >({});
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchCourse = useCallback(async () => {
    try {
      setError("");
      const [courseData, modulesData] = await Promise.all([
        apiFetch<{ course: Course }>(`/api/courses/${id}`),
        apiFetch<{ modules: Module[] }>(`/api/courses/${id}/modules`),
      ]);
      setCourse(courseData.course);
      setModules(modulesData.modules);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch {
      setError("Failed to load course");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  async function toggleModule(moduleId: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedModule === moduleId) {
      setExpandedModule(null);
      return;
    }

    setExpandedModule(moduleId);

    if (!materialsByModule[moduleId]) {
      try {
        const data = await apiFetch<{ materials: Material[] }>(
          `/api/modules/${moduleId}/materials`
        );
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMaterialsByModule((prev) => ({
          ...prev,
          [moduleId]: data.materials,
        }));
      } catch {
        // silently fail, user can retry by collapsing/expanding
      }
    }
  }

  function onRefresh() {
    setRefreshing(true);
    setMaterialsByModule({});
    setExpandedModule(null);
    fetchCourse();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <ActivityIndicator size="large" color="#4d33c4" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error || "Course not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchCourse}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4d33c4"
        />
      }
    >
      <Stack.Screen options={{ title: course.title }} />

      {/* Gradient hero */}
      <LinearGradient
        colors={["#2e1d7a", "#4d33c4", "#7c5ce7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>{course.title}</Text>
        <View style={styles.heroBadges}>
          <View
            style={[
              styles.heroBadge,
              course.status === "published"
                ? styles.heroBadgePublished
                : styles.heroBadgeDraft,
            ]}
          >
            <Text style={styles.heroBadgeText}>{course.status}</Text>
          </View>
          {course.isPublic && (
            <View style={styles.heroBadgePublic}>
              <Text style={styles.heroBadgeText}>Public</Text>
            </View>
          )}
        </View>
        {course.description ? (
          <Text style={styles.heroDesc}>{course.description}</Text>
        ) : null}
        <Text style={styles.heroDate}>
          Created {new Date(course.createdAt).toLocaleDateString()}
        </Text>
      </LinearGradient>

      {/* Modules section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{modules.length}</Text>
        </View>
      </View>

      {modules.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>No modules yet</Text>
        </View>
      ) : (
        modules.map((mod, idx) => {
          const isExpanded = expandedModule === mod.id;
          const materials = materialsByModule[mod.id];
          const matCount = materials?.length;

          return (
            <View key={mod.id} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModule(mod.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleNumberCircle}>
                  <Text style={styles.moduleNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.moduleTitle} numberOfLines={1}>
                  {mod.title}
                </Text>
                <View style={styles.moduleRight}>
                  {matCount !== undefined && (
                    <View style={styles.matCountBadge}>
                      <Text style={styles.matCountText}>{matCount}</Text>
                    </View>
                  )}
                  <Text style={styles.chevron}>
                    {isExpanded ? "▼" : "▶"}
                  </Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.materialsContainer}>
                  {!materials ? (
                    <ActivityIndicator
                      size="small"
                      color="#4d33c4"
                      style={styles.materialLoader}
                    />
                  ) : materials.length === 0 ? (
                    <Text style={styles.noMaterials}>No materials</Text>
                  ) : (
                    materials.map((mat) => {
                      const cfg = TYPE_CONFIG[mat.materialType] ?? TYPE_CONFIG.note;
                      return (
                        <TouchableOpacity
                          key={mat.id}
                          style={styles.materialItem}
                          onPress={() => router.push(`/material/${mat.id}` as any)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.materialHeader}>
                            <View
                              style={[
                                styles.typeIconCircle,
                                { backgroundColor: cfg.bg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeIconText,
                                  { color: cfg.color },
                                ]}
                              >
                                {cfg.icon}
                              </Text>
                            </View>
                            <Text
                              style={styles.materialTitle}
                              numberOfLines={1}
                            >
                              {mat.title}
                            </Text>
                          </View>
                          {mat.content ? (
                            <Text
                              style={styles.materialContent}
                              numberOfLines={3}
                            >
                              {mat.content}
                            </Text>
                          ) : null}
                          {mat.tags ? (
                            <View style={styles.tagsRow}>
                              {mat.tags.split(",").map((tag) => (
                                <View key={tag.trim()} style={styles.tag}>
                                  <Text style={styles.tagText}>
                                    {tag.trim()}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={styles.bottomSpacer} />
    </Animated.ScrollView>
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
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 10,
  },
  heroBadges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgePublished: {
    backgroundColor: "rgba(34,197,94,0.2)",
  },
  heroBadgeDraft: {
    backgroundColor: "rgba(251,191,36,0.2)",
  },
  heroBadgePublic: {
    backgroundColor: "rgba(59,130,246,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  heroDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: 8,
  },
  heroDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e1d7a",
  },
  countBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4d33c4",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  moduleCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  moduleNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  moduleNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4d33c4",
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  moduleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matCountBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  chevron: {
    fontSize: 11,
    color: "#94a3b8",
  },
  materialsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  materialLoader: {
    paddingVertical: 16,
  },
  noMaterials: {
    paddingVertical: 12,
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
  materialItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconText: {
    fontSize: 13,
    fontWeight: "800",
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  materialContent: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginTop: 6,
    marginLeft: 40,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginLeft: 40,
  },
  tag: {
    backgroundColor: "#f0ecff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: "#4d33c4",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});
