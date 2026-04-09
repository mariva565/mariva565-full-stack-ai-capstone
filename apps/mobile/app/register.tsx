import { RegisterScreen } from "../components/register/register-screen";
import { useRegisterScreen } from "../components/register/use-register-screen";

export default function RegisterRoute() {
  const viewModel = useRegisterScreen();
  return <RegisterScreen viewModel={viewModel} />;
}
