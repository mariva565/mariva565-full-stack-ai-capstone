import { CoursesListScreen } from "../../components/courses-list/courses-list-screen";
import { useCoursesList } from "../../components/courses-list/use-courses-list";

export default function CoursesTabRoute() {
  const viewModel = useCoursesList();
  return <CoursesListScreen viewModel={viewModel} />;
}
