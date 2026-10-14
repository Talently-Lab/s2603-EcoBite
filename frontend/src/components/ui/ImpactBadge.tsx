import { Leaf } from "lucide-react";

interface ImpactBadgeProps {
  titulo: string;
  savedCo2Kg: number | null;
  descripcion: string;
}

export function ImpactBadge({
  titulo,
  savedCo2Kg,
  descripcion,
}: ImpactBadgeProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl bg-eco-dark p-4 text-eco-light"
    >
      <Leaf aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="m-0 text-sm text-white font-medium">{titulo}</p>
        {savedCo2Kg !== null ? (
          <p className="mb-0 mt-1 text-lg font-bold">
            {savedCo2Kg.toLocaleString("es-AR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            kg de CO₂
          </p>
        ) : (
          <p className="mb-0 mt-1 text-3xl font-bold">Próximamente</p>
        )}
        <p className="mb-0 mt-1 text-sm">{descripcion}</p>
      </div>
    </div>
  );
}
