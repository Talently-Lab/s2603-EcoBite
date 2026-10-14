interface ComparisonBarProps {
  label: string;
  value: number | null;
  maxValue: number;
  tone: "eco" | "traditional";
  unit?: string;
}

const toneStyles = {
  eco: "bg-eco-dark",
  traditional: "bg-gray-400",
} as const;

export function ComparisonBar({
  label,
  value,
  maxValue,
  tone,
  unit = "kg de CO₂",
}: ComparisonBarProps) {
  const percentage =
    value === null || maxValue <= 0
      ? 0
      : Math.min((value / maxValue) * 100, 100);
  const formattedValue =
    value === null
      ? "Próximamente"
      : `${value.toLocaleString("es-AR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} ${unit}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-eco-dark">{label}</span>
        <span className="shrink-0 text-gray-600">{formattedValue}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-valuenow={value ?? undefined}
        aria-valuetext={formattedValue}
        className="h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${toneStyles[tone]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
