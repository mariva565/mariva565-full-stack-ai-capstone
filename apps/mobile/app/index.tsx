import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { apiFetch } from "../lib/api";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

function CourseCard({ item, index, onPress }: { item: Course; index: number; onPress: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={styles.courseCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardAccent} />
        <View style={styles.cardContent}>
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
        </View>
      </TouchableOpacity>
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

  const fetchCourses = useCallback(async () => {
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function onRefresh() {
    setRefreshing(true);
    fetchCourses();
  }

  function renderCourse({ item, index }: { item: Course; index: number }) {
    return (
      <CourseCard
        item={item}
        index={index}
        onPress={() => router.push(`/course/${item.id}`)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Branded header */}
      <LinearGradient
        colors={["#2e1d7a", "#4d33c4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>
              Welcome back,
            </Text>
            <Text style={styles.headerName}>{user?.name ?? "Student"}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courses.length}</Text>
            <Text style={styles.statLabel}>
              {courses.length === 1 ? "Course" : "Courses"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {courses.filter((c) => c.status === "published").length}
            </Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {courses.filter((c) => c.status === "draft").length}
            </Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4d33c4" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCourses}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>📖</Text>
          </View>
          <Text style={styles.emptyText}>No courses yet</Text>
          <Text style={styles.emptyHint}>
            Create courses from the web app to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCourse}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4d33c4"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6ff",
  },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  logoutBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  logoutText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardAccent: {
    width: 4,
    backgroundColor: "#4d33c4",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
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
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  badgeTextPublished: {
    color: "#166534",
  },
  badgeTextDraft: {
    color: "#92400e",
  },
  courseDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  courseDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
