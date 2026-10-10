import Button from "../ui/Button";
import { Title } from "../ui/Title";

export interface CartItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number; // Total for this line (unit price × quantity).
}

interface OrderSummaryProps {
  items?: CartItem[];
  onViewCart?: () => void;
}

export function OrderSummary({ items = [], onViewCart }: OrderSummaryProps) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  function formatCurrency(value: number) {
    return `$ ${value.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return (
    <section
      aria-labelledby="order-summary-title"
      className="flex w-full flex-col gap-4 rounded-2xl border-2 border-[#042A25] bg-white p-6 text-left shadow-sm"
    >
      <Title
        as="h2"
        id="order-summary-title"
        className="text-xl font-bold opacity-100"
      >
        Tu pedido
      </Title>

      <div className="mt-1 flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 text-sm text-gray-700"
          >
            <span className="font-medium">
              {item.quantity}
              <span className="mx-1 text-gray-400">×</span>
              {item.name}
            </span>
            <span className="shrink-0 font-medium text-gray-900">
              {formatCurrency(item.price)}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="m-0 text-sm text-gray-600">
            Todavía no agregaste platos.
          </p>
        )}
      </div>

      <hr className="my-1 w-full border-0 border-t border-gray-200" />

      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-[#042A25]">Subtotal</span>
        <span className="text-base font-bold text-[#042A25]">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <Button
        to="/carrito"
        onLinkClick={onViewCart}
        className="mt-2 block w-full text-center shadow-sm transition-colors hover:brightness-110"
      >
        Ver carrito ({totalItems} {totalItems === 1 ? "ítem" : "ítems"})
      </Button>
    </section>
  );
}
