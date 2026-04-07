import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { EmptyState } from "../components/empty-state";
import { BrandedSpinner } from "../components/branded-spinner";
import { useAuth } from "../lib/auth-context";
import { ApiError, apiFetch } from "../lib/api";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

type CourseCardProps = {
  item: Course;
  index: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function CourseCard({ item, index, onOpen, onEdit, onDelete }: CourseCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, index, slideAnim])
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.courseCard}>
        <View style={styles.cardAccent} />
        <TouchableOpacity style={styles.cardContent} onPress={onOpen} activeOpacity={0.75}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.courseDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.courseDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <View style={styles.inlineActions}>
          <TouchableOpacity
            style={[styles.inlineActionBtn, styles.inlineEditBtn]}
            onPress={onEdit}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.inlineActionText, styles.inlineEditText]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inlineActionBtn, styles.inlineDeleteBtn]}
            onPress={onDelete}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.inlineActionText, styles.inlineDeleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function CoursesListScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const data = await apiFetch<{ courses: Course[] }>("/api/courses");
      setCourses(data.courses);
    } catch {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  const handleDeleteCourse = useCallback(
    (course: Course) => {
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
                setCourses((current) => current.filter((item) => item.id !== course.id));
              } catch (error) {
                const message =
                  error instanceof ApiError ? error.message : "Failed to delete course";
                Alert.alert("Delete failed", message);
              }
            },
          },
        ]
      );
    },
    []
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#2e1d7a", "#4d33c4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Welcome back,</Text>
            <Text style={styles.headerName}>{user?.name ?? "Student"}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/profile" as any)} style={styles.profileBtn}>
              <Text style={styles.profileBtnText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courses.length}</Text>
            <Text style={styles.statLabel}>{courses.length === 1 ? "Course" : "Courses"}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {courses.filter((course) => course.status === "published").length}
            </Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {courses.filter((course) => course.status === "draft").length}
            </Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <BrandedSpinner message="Loading courses..." />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCourses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : courses.length === 0 ? (
        <EmptyState icon="Courses" title="No courses yet" subtitle="Tap + to create your first course" />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCourses(true)}
              tintColor="#4d33c4"
            />
          }
          renderItem={({ item, index }) => (
            <CourseCard
              item={item}
              index={index}
              onOpen={() => router.push(`/course/${item.id}`)}
              onEdit={() => router.push(`/course/${item.id}/edit` as any)}
              onDelete={() => handleDeleteCourse(item)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-course" as any)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={["#4d33c4", "#7c5ce7"]} style={styles.fabGradient}>
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f6ff" },
  headerGradient: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerGreeting: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  headerName: { fontSize: 22, fontWeight: "800", color: "#ffffff", marginTop: 2 },
  headerRight: { alignItems: "flex-end", gap: 8 },
  profileBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  profileBtnText: { fontSize: 12, fontWeight: "600", color: "#ffffff" },
  logoutBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  logoutText: { color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: 13 },
  statsRow: { flexDirection: "row", marginTop: 20, gap: 12 },
  statItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "800", color: "#ffffff" },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 2,
  },
  list: { padding: 16, paddingBottom: 96 },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardAccent: { height: 4, backgroundColor: "#4d33c4" },
  cardContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  courseTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  inlineActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineEditBtn: {
    backgroundColor: "#f5f3ff",
    borderColor: "#c4b5fd",
  },
  inlineDeleteBtn: {
    backgroundColor: "#fff1f2",
    borderColor: "#fda4af",
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  inlineEditText: {
    color: "#5b21b6",
  },
  inlineDeleteText: {
    color: "#be123c",
  },
  courseDesc: { fontSize: 14, color: "#64748b", lineHeight: 20, marginTop: 8 },
  courseDate: { fontSize: 12, color: "#94a3b8", marginTop: 10 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 16, textAlign: "center" },
  retryBtn: {
    backgroundColor: "#4d33c4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#ffffff", fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: "#4d33c4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: { fontSize: 28, fontWeight: "600", color: "#ffffff", marginTop: -2 },
});
