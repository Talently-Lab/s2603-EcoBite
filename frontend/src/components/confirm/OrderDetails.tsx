import { Title } from "../ui/Title";
import type { CartItem } from "../detailRestaurant/OrderSummary";

interface OrderDetailsProps {
  items: CartItem[];
}

function formatCurrency(value: number) {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function OrderDetails({ items }: OrderDetailsProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section
      aria-labelledby="confirmed-order-title"
      className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <Title
          as="h2"
          id="confirmed-order-title"
          className="text-xl font-bold opacity-100"
        >
          Resumen del pedido
        </Title>
        <span className="text-sm text-gray-600">
          {totalItems} {totalItems === 1 ? "producto" : "productos"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={`${item.restaurantName}-${item.id}`}
            className="flex items-start justify-between gap-4 text-sm text-gray-700"
          >
            <span>
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
            No hay detalles del pedido disponibles.
          </p>
        )}
      </div>

      <hr className="my-0 w-full border-0 border-t border-gray-200" />

      <div className="flex items-center justify-between gap-4 font-bold text-eco-dark">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </section>
  );
}