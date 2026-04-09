import { ProfileTabScreen } from "../../components/profile-tab/profile-tab-screen";
import { useProfileTab } from "../../components/profile-tab/use-profile-tab";

export default function ProfileTabRoute() {
  const viewModel = useProfileTab();
  return <ProfileTabScreen viewModel={viewModel} />;
}
