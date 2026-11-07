import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  description?: string;
  variation?: {
    percentage: number | null;
    direction: "subio" | "bajo" | "igual" | null;
  };
}

export function MetricCard({
  label,
  value,
  icon,
  description,
  variation,
}: MetricCardProps) {
  const variationText =
    !variation ||
    variation.percentage === null ||
    variation.direction === null
      ? "Sin datos del mes anterior"
      : `${variation.direction === "subio" ? "▲" : variation.direction === "bajo" ? "▼" : "●"} ${Math.abs(variation.percentage).toLocaleString("es-AR", { maximumFractionDigits: 0 })} % respecto del mes anterior`;
  const variationClass =
    variation?.direction === "subio"
      ? "text-gray-600"
      : variation?.direction === "bajo"
        ? "text-rose-700"
        : "text-gray-500";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-eco-light/70 text-eco-dark">
            {icon}
          </span>
        )}
        <p className="text-[10px] font-semibold text-gray-600">
          {label}
        </p>
      </div>
      <p className="mt-1 text-lg font-bold leading-tight text-eco-dark">
        {value}
      </p>
      {variation ? (
        <p className={`mt-1 text-[9px] leading-tight ${variationClass}`}>
          {variationText}
        </p>
      ) : (
        description && (
          <p className="mt-1 text-[9px] leading-tight text-gray-500">
            {description}
          </p>
        )
      )}
    </article>
  );
}
