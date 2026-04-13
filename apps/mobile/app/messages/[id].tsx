import { useLocalSearchParams } from "expo-router";
import { MessageThreadScreen } from "../../components/messages/message-thread-screen";

export default function MessageThreadRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const conversationId = Number(rawId);
  return <MessageThreadScreen conversationId={conversationId} />;
}
