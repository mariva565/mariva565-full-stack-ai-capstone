import { useLocalSearchParams } from "expo-router";

import { CourseDetailsScreen } from "../../../components/course-details/course-details-screen";

export default function CourseDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CourseDetailsScreen routeId={String(id)} />;
}
