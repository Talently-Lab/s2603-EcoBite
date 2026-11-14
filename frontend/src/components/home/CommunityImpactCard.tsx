import { useEffect, useState } from "react";
import { Cloud, MapPin, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import Badge from "../ui/Badge";
import { Title } from "../ui/Title";
import { AnimatedNumber } from "../ui/AnimatedNumber";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

interface CommunityImpact {
  co2_total_ahorrado: number;
  km_totales: number;
  pedidos_entregados: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNonNegativeNumber(value: unknown): number {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !value.trim())
  ) {
    throw new Error("El servidor devolvió indicadores de impacto inválidos.");
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("El servidor devolvió indicadores de impacto inválidos.");
  }
  return parsed;
}

function parseCommunityImpact(value: unknown): CommunityImpact {
  if (
    !isRecord(value) ||
    !isRecord(value.impacto)
  ) {
    throw new Error("El servidor devolvió datos de impacto inválidos.");
  }

  const impact = value.impacto;

  return {
    co2_total_ahorrado: parseNonNegativeNumber(impact.co2_total_ahorrado),
    km_totales: parseNonNegativeNumber(impact.km_totales),
    pedidos_entregados: parseNonNegativeNumber(impact.pedidos_entregados),
  };
}

interface CommunityImpactMetricProps {
  label: string;
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  suffix?: string;
  icon: ReactNode;
}

function CommunityImpactMetric({
  label,
  value,
  minimumFractionDigits,
  maximumFractionDigits = 0,
  suffix,
  icon,
}: CommunityImpactMetricProps) {
  return (
    <article className="flex min-h-24 flex-col rounded-xl bg-eco-background p-3 sm:min-h-28 sm:p-4">
      {icon}
      <p className="mb-0 mt-2 text-base font-bold text-eco-dark sm:text-lg">
        <AnimatedNumber
          value={value}
          minimumFractionDigits={minimumFractionDigits}
          maximumFractionDigits={maximumFractionDigits}
          suffix={suffix}
        />
      </p>
      <p className="mb-0 mt-1 text-[10px] leading-tight text-eco-text-secondary sm:text-xs">
        {label}
      </p>
    </article>
  );
}

export function CommunityImpactCard() {
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadImpact() {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/impacto`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`No se pudo cargar el impacto (estado ${response.status}).`);
        }

        const body: unknown = await response.json();
        setImpact(parseCommunityImpact(body));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el impacto de la comunidad.",
        );
      }
    }

    void loadImpact();
    return () => controller.abort();
  }, []);

  const indicators = impact
    ? [
        {
          label: "Pedidos entregados",
          value: impact.pedidos_entregados,
          icon: <ShoppingBag aria-hidden="true" className="h-4 w-4 text-eco-dark" strokeWidth={1.8} />,
        },
        {
          label: "CO₂ ahorrado",
          value: impact.co2_total_ahorrado,
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
          suffix: " kg",
          icon: <Cloud aria-hidden="true" className="h-4 w-4 text-eco-dark" strokeWidth={1.8} />,
        },
        {
          label: "Kilómetros recorridos",
          value: impact.km_totales,
          suffix: " km",
          icon: <MapPin aria-hidden="true" className="h-4 w-4 text-eco-dark" strokeWidth={1.8} />,
        },
      ]
    : [];

  return (
    <section
      aria-labelledby="community-impact-title"
      className="w-full rounded-2xl border md:min-h-60 border-eco-sage/60 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Title
          id="community-impact-title"
          as="h2"
          className="text-lg font-semibold text-eco-dark"
        >
          Impacto de la comunidad
        </Title>
        <Badge
          text="Datos en vivo"
          className="shrink-0 bg-eco-background px-2.5 py-1 text-[10px] font-medium text-eco-text-secondary"
        />
      </div>

      {impact ? (
        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {indicators.map(
            ({
              label,
              value,
              minimumFractionDigits,
              maximumFractionDigits,
              suffix,
              icon,
            }) => (
              <CommunityImpactMetric
                key={label}
                label={label}
                value={value}
                minimumFractionDigits={minimumFractionDigits}
                maximumFractionDigits={maximumFractionDigits}
                suffix={suffix}
                icon={icon}
              />
            ),
          )}
        </div>
      ) : (
        <p
          className={`mb-0 mt-4 text-sm ${error ? "text-red-700" : "text-eco-text-secondary"}`}
          role={error ? "alert" : "status"}
        >
          {error ?? "Cargando indicadores de impacto..."}
        </p>
      )}
    </section>
  );
}
