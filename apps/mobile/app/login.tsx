import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.description}>
          Phase 0 mobile placeholder. Authentication wiring follows in Phase 2.
        </Text>
        <Link href="/" style={styles.link}>
          Continue to Courses List
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f6ff"
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
    color: "#2e1d7a"
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
