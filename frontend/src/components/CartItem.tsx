type CartLine = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type CartItemProps = {
  item: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <article className="flex items-start justify-between gap-4 border-b border-green-100 py-4">
      <div className="min-w-0">
        <h3 className="truncate font-medium text-gray-800">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
        <button
          className="mt-2 text-sm font-medium text-red-700 hover:underline"
          onClick={onRemove}
          type="button"
        >
          Quitar
        </button>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-semibold text-gray-800">
          ${(item.unitPrice * item.quantity).toFixed(2)}
        </span>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Cantidad
          <input
            aria-label={`Cantidad de ${item.name}`}
            className="w-16 rounded border border-green-200 px-2 py-1 text-center"
            min={1}
            onChange={(event) => onQuantityChange(Number(event.target.value))}
            type="number"
            value={item.quantity}
          />
        </label>
      </div>
    </article>
  );
}
