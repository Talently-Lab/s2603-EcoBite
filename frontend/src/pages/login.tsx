import { Link } from "react-router-dom";
import { LoginForm } from "../components/login/LoginForm";

export function LoginPage() {
  return (
    <>
      <h1 className="sr-only">Iniciar sesión</h1>
      <p className="mb-6 mt-0 text-sm text-gray-600">
        Ingresá a tu cuenta de EcoBite.
      </p>
      <LoginForm />
      <p className="mb-0 mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{" "}
        <Link
          to="/registro"
          className="font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
        >
          Registrate
        </Link>
      </p>
    </>
  );
}
