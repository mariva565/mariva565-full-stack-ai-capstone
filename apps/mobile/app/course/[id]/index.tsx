import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BrandedSpinner } from "../../../components/branded-spinner";
import { EmptyState } from "../../../components/empty-state";
import { EntityActions } from "../../../components/entity-actions";
import { ApiError, apiFetch } from "../../../lib/api";

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
  const [materialsByModule, setMaterialsByModule] = useState<Record<number, Material[]>>({});
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchModuleMaterials = useCallback(async (moduleId: number) => {
    const data = await apiFetch<{ materials: Material[] }>(`/api/modules/${moduleId}/materials`);
    setMaterialsByModule((prev) => ({ ...prev, [moduleId]: data.materials }));
    return data.materials;
  }, []);

  const fetchCourse = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError("");
        const [courseData, modulesData] = await Promise.all([
          apiFetch<{ course: Course }>(`/api/courses/${id}`),
          apiFetch<{ modules: Module[] }>(`/api/courses/${id}/modules`),
        ]);

        setCourse(courseData.course);
        setModules(modulesData.modules);

        const expandedStillExists = modulesData.modules.some((module) => module.id === expandedModule);
        if (expandedModule && expandedStillExists) {
          await fetchModuleMaterials(expandedModule);
        } else if (expandedModule && !expandedStillExists) {
          setExpandedModule(null);
        }

        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [expandedModule, fadeAnim, fetchModuleMaterials, id]
  );

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
    }, [fetchCourse])
  );

  const toggleModule = useCallback(
    async (moduleId: number) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if (expandedModule === moduleId) {
        setExpandedModule(null);
        return;
      }

      setExpandedModule(moduleId);

      if (!materialsByModule[moduleId]) {
        try {
          await fetchModuleMaterials(moduleId);
        } catch {
          Alert.alert("Load failed", "Could not load materials for this module.");
        }
      }
    },
    [expandedModule, fetchModuleMaterials, materialsByModule]
  );

  const handleDeleteModule = useCallback((module: Module) => {
    Alert.alert(
      "Delete module",
      `Delete "${module.title}" and all its materials?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/modules/${module.id}`, { method: "DELETE" });
              setModules((current) => current.filter((item) => item.id !== module.id));
              setMaterialsByModule((current) => {
                const next = { ...current };
                delete next[module.id];
                return next;
              });
              if (expandedModule === module.id) {
                setExpandedModule(null);
              }
            } catch (error) {
              const message =
                error instanceof ApiError ? error.message : "Failed to delete module";
              Alert.alert("Delete failed", message);
            }
          },
        },
      ]
    );
  }, [expandedModule]);

  const handleDeleteMaterial = useCallback((moduleId: number, material: Material) => {
    Alert.alert(
      "Delete material",
      `Delete "${material.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/materials/${material.id}`, { method: "DELETE" });
              setMaterialsByModule((current) => ({
                ...current,
                [moduleId]: (current[moduleId] ?? []).filter((item) => item.id !== material.id),
              }));
            } catch (error) {
              const message =
                error instanceof ApiError ? error.message : "Failed to delete material";
              Alert.alert("Delete failed", message);
            }
          },
        },
      ]
    );
  }, []);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <BrandedSpinner message="Loading course..." />
      </>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error || "Course not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCourse()}>
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
          onRefresh={() => fetchCourse(true)}
          tintColor="#4d33c4"
        />
      }
    >
      <Stack.Screen options={{ title: course.title }} />

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
              course.status === "published" ? styles.heroBadgePublished : styles.heroBadgeDraft,
            ]}
          >
            <Text style={styles.heroBadgeText}>{course.status}</Text>
          </View>
          {course.isPublic ? (
            <View style={styles.heroBadgePublic}>
              <Text style={styles.heroBadgeText}>Public</Text>
            </View>
          ) : null}
        </View>
        {course.description ? <Text style={styles.heroDesc}>{course.description}</Text> : null}
        <Text style={styles.heroDate}>
          Created {new Date(course.createdAt).toLocaleDateString()}
        </Text>
        <View style={styles.courseActionsRow}>
          <TouchableOpacity
            style={[styles.courseActionBtn, styles.courseEditBtn]}
            onPress={() => router.push(`/course/${id}/edit` as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.courseActionText, styles.courseEditText]}>Edit Course</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.courseActionBtn, styles.courseDeleteBtn]}
            onPress={() =>
              Alert.alert(
                "Delete course",
                `Delete "${course.title}"? This will also remove its modules and materials.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await apiFetch(`/api/courses/${course.id}`, { method: "DELETE" });
                        router.replace("/");
                      } catch (error) {
                        const message =
                          error instanceof ApiError ? error.message : "Failed to delete course";
                        Alert.alert("Delete failed", message);
                      }
                    },
                  },
                ]
              )
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.courseActionText, styles.courseDeleteText]}>Delete Course</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{modules.length}</Text>
        </View>
      </View>

      {modules.length === 0 ? (
        <EmptyState icon="Modules" title="No modules yet" subtitle="This course does not have modules yet." />
      ) : (
        modules.map((module, index) => {
          const isExpanded = expandedModule === module.id;
          const materials = materialsByModule[module.id];

          return (
            <View key={module.id} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModule(module.id)}
                activeOpacity={0.75}
              >
                <View style={styles.moduleNumberCircle}>
                  <Text style={styles.moduleNumber}>{index + 1}</Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle} numberOfLines={1}>
                    {module.title}
                  </Text>
                  <Text style={styles.moduleMeta}>
                    {materials ? `${materials.length} materials` : "Tap to load materials"}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? "Hide" : "Show"}</Text>
              </TouchableOpacity>

              <View style={styles.moduleActionWrap}>
                <EntityActions
                  compact
                  onEdit={() => router.push(`/module/${module.id}/edit` as any)}
                  onDelete={() => handleDeleteModule(module)}
                />
              </View>

              {isExpanded ? (
                <View style={styles.materialsContainer}>
                  <View style={styles.materialsHeader}>
                    <Text style={styles.materialsHeaderLabel}>Materials</Text>
                    <Text style={styles.materialsHeaderHint}>
                      {materials ? `${materials.length} items in this module` : "Loading module items"}
                    </Text>
                  </View>
                  {!materials ? (
                    <ActivityIndicator size="small" color="#4d33c4" style={styles.materialLoader} />
                  ) : materials.length === 0 ? (
                    <Text style={styles.noMaterials}>No materials yet</Text>
                  ) : (
                    materials.map((material) => {
                      const config = TYPE_CONFIG[material.materialType] ?? TYPE_CONFIG.note;
                      return (
                        <View key={material.id} style={styles.materialCard}>
                          <TouchableOpacity
                            style={styles.materialMain}
                            onPress={() => router.push(`/material/${material.id}` as any)}
                            activeOpacity={0.75}
                          >
                            <View style={styles.materialHeader}>
                              <View style={[styles.typeIconCircle, { backgroundColor: config.bg }]}>
                                <Text style={[styles.typeIconText, { color: config.color }]}>
                                  {config.icon}
                                </Text>
                              </View>
                              <View style={styles.materialTextWrap}>
                                <Text style={styles.materialTitle} numberOfLines={1}>
                                  {material.title}
                                </Text>
                                {material.content ? (
                                  <Text style={styles.materialContent} numberOfLines={3}>
                                    {material.content}
                                  </Text>
                                ) : null}
                              </View>
                            </View>

                            {material.tags ? (
                              <View style={styles.tagsRow}>
                                {material.tags.split(",").map((tag) => (
                                  <View key={tag.trim()} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag.trim()}</Text>
                                  </View>
                                ))}
                              </View>
                            ) : null}
                          </TouchableOpacity>

                          <EntityActions
                            compact
                            onEdit={() => router.push(`/material/${material.id}/edit` as any)}
                            onDelete={() => handleDeleteMaterial(module.id, material)}
                          />
                        </View>
                      );
                    })
                  )}

                  <TouchableOpacity
                    style={styles.addMaterialBtn}
                    onPress={() => router.push(`/module/${module.id}/add-material` as any)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.addMaterialPlus}>+</Text>
                    <Text style={styles.addMaterialText}>Add Material</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })
      )}

      <View style={styles.bottomSpacer} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f6ff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6ff",
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 16, textAlign: "center" },
  retryBtn: {
    backgroundColor: "#4d33c4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: { color: "#ffffff", fontWeight: "600" },
  hero: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", marginBottom: 10 },
  heroBadges: { flexDirection: "row", gap: 8, marginBottom: 12 },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  heroBadgePublished: { backgroundColor: "rgba(34,197,94,0.2)" },
  heroBadgeDraft: { backgroundColor: "rgba(251,191,36,0.2)" },
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
  heroDate: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  courseActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  courseActionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  courseEditBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  courseDeleteBtn: {
    backgroundColor: "rgba(190,24,93,0.18)",
    borderColor: "rgba(253,164,175,0.4)",
  },
  courseActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  courseEditText: {
    color: "#ffffff",
  },
  courseDeleteText: {
    color: "#ffe4e6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2e1d7a" },
  countBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: { fontSize: 13, fontWeight: "700", color: "#4d33c4" },
  moduleCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  moduleNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  moduleNumber: { fontSize: 13, fontWeight: "700", color: "#4d33c4" },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  moduleMeta: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  chevron: { fontSize: 12, color: "#64748b", fontWeight: "700" },
  moduleActionWrap: { paddingHorizontal: 14, paddingBottom: 12 },
  materialsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e7e2ff",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fcfbff",
  },
  materialsHeader: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1edff",
  },
  materialsHeaderLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#5b21b6",
  },
  materialsHeaderHint: {
    fontSize: 12,
    color: "#7c6ea8",
    marginTop: 4,
  },
  materialLoader: { paddingVertical: 18 },
  noMaterials: {
    paddingVertical: 16,
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
  materialCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3efff",
  },
  materialMain: { gap: 8 },
  materialHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  materialTextWrap: { flex: 1 },
  typeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconText: { fontSize: 13, fontWeight: "800" },
  materialTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  materialContent: { fontSize: 13, color: "#64748b", lineHeight: 19, marginTop: 6 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginLeft: 40 },
  tag: {
    backgroundColor: "#f0ecff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: "#4d33c4", fontWeight: "500" },
  addMaterialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addMaterialPlus: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  addMaterialText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  bottomSpacer: { height: 32 },
});
