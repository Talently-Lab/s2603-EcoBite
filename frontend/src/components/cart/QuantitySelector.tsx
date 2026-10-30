import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  itemName: string;
  quantity: number;
  onChange: (change: -1 | 1) => void;
}

export default function QuantitySelector({
  itemName,
  quantity,
  onChange,
}: QuantitySelectorProps) {
  return (
    <div
      aria-label={`Cantidad: ${quantity}`}
      className="inline-flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-semibold text-eco-dark"
    >
      <button
        type="button"
        aria-label={`Restar una unidad de ${itemName}`}
        disabled={quantity <= 1}
        onClick={() => onChange(-1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-eco-light/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        aria-label={`Sumar una unidad de ${itemName}`}
        onClick={() => onChange(1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-eco-light/30"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}