import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Course Details</Text>
        <Text style={styles.description}>Placeholder for course id: {id}</Text>
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
    color: "#334155"
  }
});
