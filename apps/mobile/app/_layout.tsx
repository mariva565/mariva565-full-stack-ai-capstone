import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f8f6ff" },
        headerTintColor: "#2e1d7a"
      }}
    />
  );
}
