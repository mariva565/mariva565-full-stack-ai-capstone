import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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

  function renderCourse({ item }: { item: Course }) {
    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => router.push(`/course/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.badge,
              item.status === "published" ? styles.badgePublished : styles.badgeDraft,
            ]}
          >
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.courseDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.courseDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Courses",
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {user && (
        <View style={styles.welcomeBar}>
          <Text style={styles.welcomeText}>
            Welcome, {user.name}
          </Text>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      )}

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
          <Text style={styles.emptyIcon}>📖</Text>
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
  welcomeBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2e1d7a",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4d33c4",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
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
    color: "#334155",
    textTransform: "capitalize",
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
