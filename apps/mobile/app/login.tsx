import { LoginScreen } from "../components/login/login-screen";
import { useLoginScreen } from "../components/login/use-login-screen";

export default function LoginRoute() {
  const viewModel = useLoginScreen();
  return <LoginScreen viewModel={viewModel} />;
}
