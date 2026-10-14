import { Link, useLocation } from "react-router-dom";
import { AccountTabs } from "../components/login/AccountTabs";
import { LoginForm } from "../components/login/LoginForm";

export function LoginPage() {
  const { pathname } = useLocation();
  const isRegisterPage = pathname === "/registro";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start justify-center px-5 py-12 sm:items-center sm:px-8">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <AccountTabs activeTab={isRegisterPage ? "register" : "login"} />
        {isRegisterPage ? (
          <div>
            <h1 className="m-0 text-2xl font-bold text-eco-dark">
              Crear una cuenta
            </h1>
            <p className="mb-0 mt-3 text-sm text-gray-600">
              El registro estará disponible próximamente.
            </p>
          </div>
        ) : (
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
        )}
      </section>
    </main>
  );
}
