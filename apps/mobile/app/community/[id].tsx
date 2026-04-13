import { useLocalSearchParams } from "expo-router";
import { PostDetailsScreen } from "../../components/community/post-details-screen";

export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetailsScreen postId={Number(id)} />;
}
