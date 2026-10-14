import Button from "../ui/Button";
import { ImpactBadge } from "../ui/ImpactBadge";
import { Title } from "../ui/Title";
import { Link } from "react-router-dom";
import type { CartItem } from "../detailRestaurant/OrderSummary";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

function formatCurrency(value: number) {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function CheckoutOrderSummary({
  items,
  savedCo2Kg,
}: CheckoutOrderSummaryProps) {
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="flex w-full flex-col gap-5 rounded-2xl border-2 border-eco-dark bg-white p-5 text-left shadow-sm sm:p-6 lg:sticky lg:top-6"
    >
      <Title
        as="h2"
        id="checkout-summary-title"
        className="text-xl font-bold opacity-100"
      >
        Resumen del pedido
      </Title>

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
      </div>

      <hr className="my-0 w-full border-0 border-t border-gray-200" />

      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
        <span>Envío</span>
        <span>Se calcula después</span>
      </div>
      <div className="flex items-center justify-between gap-4 font-bold text-eco-dark">
        <span>Total</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <ImpactBadge
        titulo="Ahorraste con este pedido"
        savedCo2Kg={savedCo2Kg}
        descripcion="Impacto ambiental de tu pedido"
      />

      <Button
        type="submit"
        className="block w-full text-center shadow-sm transition-colors hover:brightness-110"
      >
        Confirmar pedido
      </Button>
      <Link
        to="/carrito"
        className="text-center text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
      >
        Volver al carrito
      </Link>
      <p className="m-0 text-center text-xs text-gray-500">
        Checkout de prueba. No se realizará ningún cobro.
      </p>
    </aside>
  );
}
