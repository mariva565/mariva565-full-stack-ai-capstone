import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
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

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [materialsByModule, setMaterialsByModule] = useState<
    Record<number, Material[]>
  >({});
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCourse = useCallback(async () => {
    try {
      setError("");
      const [courseData, modulesData] = await Promise.all([
        apiFetch<{ course: Course }>(`/api/courses/${id}`),
        apiFetch<{ modules: Module[] }>(`/api/courses/${id}/modules`),
      ]);
      setCourse(courseData.course);
      setModules(modulesData.modules);
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
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      return;
    }

    setExpandedModule(moduleId);

    // Fetch materials if not cached
    if (!materialsByModule[moduleId]) {
      try {
        const data = await apiFetch<{ materials: Material[] }>(
          `/api/modules/${moduleId}/materials`
        );
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4d33c4"
        />
      }
    >
      <Stack.Screen options={{ title: course.title }} />

      {/* Course info */}
      <View style={styles.heroCard}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.badge,
              course.status === "published"
                ? styles.badgePublished
                : styles.badgeDraft,
            ]}
          >
            <Text style={styles.badgeText}>{course.status}</Text>
          </View>
          {course.isPublic && (
            <View style={styles.badgePublic}>
              <Text style={styles.badgeText}>Public</Text>
            </View>
          )}
        </View>
        {course.description ? (
          <Text style={styles.description}>{course.description}</Text>
        ) : null}
        <Text style={styles.dateText}>
          Created {new Date(course.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Modules */}
      <Text style={styles.sectionTitle}>
        Modules ({modules.length})
      </Text>

      {modules.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No modules yet</Text>
        </View>
      ) : (
        modules.map((mod) => (
          <View key={mod.id} style={styles.moduleCard}>
            <TouchableOpacity
              style={styles.moduleHeader}
              onPress={() => toggleModule(mod.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.chevron}>
                {expandedModule === mod.id ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>

            {expandedModule === mod.id && (
              <View style={styles.materialsContainer}>
                {!materialsByModule[mod.id] ? (
                  <ActivityIndicator
                    size="small"
                    color="#4d33c4"
                    style={styles.materialLoader}
                  />
                ) : materialsByModule[mod.id].length === 0 ? (
                  <Text style={styles.noMaterials}>No materials</Text>
                ) : (
                  materialsByModule[mod.id].map((mat) => (
                    <View key={mat.id} style={styles.materialItem}>
                      <View style={styles.materialHeader}>
                        <Text style={styles.typeIcon}>
                          {mat.materialType === "link"
                            ? "🔗"
                            : mat.materialType === "file"
                              ? "📎"
                              : "📝"}
                        </Text>
                        <Text style={styles.materialTitle} numberOfLines={1}>
                          {mat.title}
                        </Text>
                      </View>
                      {mat.content ? (
                        <Text style={styles.materialContent} numberOfLines={3}>
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
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))
      )}

      <View style={styles.bottomSpacer} />
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
  heroCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePublished: {
    backgroundColor: "#dcfce7",
  },
  badgeDraft: {
    backgroundColor: "#fef3c7",
  },
  badgePublic: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e1d7a",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  moduleCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    fontSize: 12,
    color: "#94a3b8",
  },
  materialsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    gap: 8,
  },
  typeIcon: {
    fontSize: 16,
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
    marginTop: 4,
    marginLeft: 24,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginLeft: 24,
  },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#64748b",
  },
  bottomSpacer: {
    height: 32,
  },
});
