import { Title } from "../ui/Title";
import { ComparisonBar } from "./ComparisonBar";

export function ComparisonChart() {
  const comparisons = [
    { label: "Este pedido", value: null, tone: "eco" as const },
    {
      label: "Delivery tradicional",
      value: null,
      tone: "traditional" as const,
    },
  ];
  const availableValues = comparisons.flatMap((item) =>
    item.value === null ? [] : [item.value],
  );
  const maxValue = Math.max(...availableValues, 0);

  return (
    <section
      aria-labelledby="delivery-comparison-title"
      className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <Title
        as="h2"
        id="delivery-comparison-title"
        className="text-lg font-bold opacity-100"
      >
        Comparación con un delivery tradicional
      </Title>
      <p className="m-0 text-sm text-gray-600">
        Próximamente vas a poder comparar el impacto de este pedido con una
        entrega tradicional.
      </p>
      <div className="flex flex-col gap-3">
        {comparisons.map((comparison) => (
          <ComparisonBar
            key={comparison.label}
            label={comparison.label}
            value={comparison.value}
            maxValue={maxValue}
            tone={comparison.tone}
          />
        ))}
      </div>
    </section>
  );
}
