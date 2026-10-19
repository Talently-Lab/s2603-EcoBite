import { RegistrationForm } from "../components/login/RegistrationForm";

export function RegistroPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-2xl font-bold text-eco-dark">
        Crear una cuenta
      </h1>
      <p className="m-0 text-sm text-gray-600">
        Elegí el tipo de cuenta y completá tus datos para registrarte.
      </p>
      <RegistrationForm />
    </div>
  );
}
