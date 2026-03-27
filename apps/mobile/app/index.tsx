import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function CoursesListScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Courses List</Text>
        <Text style={styles.description}>
          Placeholder for the mobile courses feed from the same Next.js backend API.
        </Text>
        <Link href="/course/1" style={styles.link}>
          Open Course #1
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  title: {
    marginBottom: 8,
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a"
  },
  description: {
    marginBottom: 20,
    color: "#334155"
  },
  link: {
    color: "#4d33c4",
    fontWeight: "600"
  }
});
