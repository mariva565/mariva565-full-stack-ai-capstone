import { Stack, useLocalSearchParams } from "expo-router";
import { AiToolsScreen } from "../../../components/material/ai-tools/ai-tools-screen";

export default function AiToolsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const materialId = parseInt(id, 10);

  if (isNaN(materialId)) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: "AI Study Tools" }} />
      <AiToolsScreen materialId={materialId} />
    </>
  );
}
