import { RegistrationForm } from "../components/login/RegistrationForm";

export function RegistroPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">Registrarme</h1>
      <RegistrationForm />
    </div>
  );
}
