import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Cloud, ShoppingBag } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getClientImpact, type ClientImpact } from "../services/clientImpact";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import Button from "../components/ui/Button";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { Loader } from "../components/ui/Loader";
import { getUserDashboardPath } from "../utils/userRoutes";
import { getUserOrdersPath } from "../utils/userRoutes";

export function DashboardImpactoPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [impact, setImpact] = useState<ClientImpact | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (authLoading || user?.rol !== "cliente" || !token) return;

    const controller = new AbortController();

    getClientImpact(token, controller.signal)
      .then(setImpact)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar tu impacto ambiental.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, retryCount, token, user?.rol]);

  if (authLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Verificando sesión" />
      </main>
    );
  }

  if (user?.rol !== "cliente") {
    return (
      <Navigate
        to={user?.rol === "restaurante" ? getUserDashboardPath(user) : "/"}
        replace
      />
    );
  }

  const indicators = impact
    ? [
        {
          label: "Pedidos entregados",
          value: impact.pedidos_entregados,
          suffix: "",
          maximumFractionDigits: 0,
          icon: <ShoppingBag aria-hidden="true" className="h-5 w-5" />,
        },
        {
          label: "CO₂ ahorrado",
          value: impact.co2_total_ahorrado,
          suffix: " kg",
          maximumFractionDigits: 2,
          icon: <Cloud aria-hidden="true" className="h-5 w-5" />,
        },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="m-0 text-2xl font-bold text-eco-dark sm:text-3xl">
        Mi impacto ambiental
      </h1>
      <p className="mb-0 mt-2 max-w-2xl text-sm text-eco-text-secondary sm:text-base">
        Consultá el impacto ambiental generado por tus pedidos entregados.
      </p>

      <section
        aria-label="Indicadores de impacto ambiental"
        className="mt-6 rounded-2xl border border-eco-sage/60 bg-white p-5 shadow-sm sm:p-6"
      >
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader label="Cargando tu impacto" />
          </div>
        ) : loadError ? (
          <div className="space-y-4">
            <GlobalAlert message={loadError} />
            <Button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                setRetryCount((count) => count + 1);
              }}
              className="cursor-pointer"
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {indicators.map(
              ({ label, value, suffix, maximumFractionDigits, icon }) => (
                <article
                  key={label}
                  className="rounded-xl bg-eco-background p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2 text-eco-dark">
                    {icon}
                    <h2 className="m-0 text-sm font-semibold text-eco-text-secondary">
                      {label}
                    </h2>
                  </div>
                  <p className="mb-0 mt-4 text-3xl font-bold text-eco-dark sm:text-4xl">
                    <AnimatedNumber
                      value={value}
                      maximumFractionDigits={maximumFractionDigits}
                      suffix={suffix}
                    />
                  </p>
                </article>
              ),
            )}
          </div>
        )}
      </section>
      <Link
        to={user ? getUserOrdersPath(user) : "/"}
        className="mt-6 inline-block text-sm font-semibold text-eco-dark underline underline-offset-4 hover:text-eco-text-secondary"
      >
        Ver mis pedidos
      </Link>
    </main>
  );
}
