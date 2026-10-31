import { useOutletContext } from "react-router-dom";
import { RegistrationForm } from "../components/login/RegistrationForm";
import type { RegistrationProgressContext } from "../layouts/AuthLayout";

export function RegistroPage() {
  const { setRegistrationStep, setRegistrationAccountType } =
    useOutletContext<RegistrationProgressContext>();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">Registrarme</h1>
      <RegistrationForm
        onStepChange={setRegistrationStep}
        onAccountTypeChange={setRegistrationAccountType}
      />
    </div>
  );
}
