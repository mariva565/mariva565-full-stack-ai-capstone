import { SettingsScreen } from "../components/settings/settings-screen";
import { useSettingsScreen } from "../components/settings/use-settings-screen";

export default function SettingsRoute() {
  const viewModel = useSettingsScreen();
  return <SettingsScreen viewModel={viewModel} />;
}
