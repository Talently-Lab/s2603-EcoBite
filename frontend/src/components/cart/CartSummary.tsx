import Button from "../ui/Button";
import { ImpactBadge } from "../ui/ImpactBadge";
import { Title } from "../ui/Title";
import { Link } from "react-router-dom";
import type { CartItem } from "../detailRestaurant/OrderSummary";

interface CartSummaryProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

export default function CartSummary({ items, savedCo2Kg }: CartSummaryProps) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  function formatCurrency(value: number) {
    return `$ ${value.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="flex w-full flex-col gap-5 rounded-2xl border-2 border-eco-dark bg-white p-6 text-left shadow-sm"
    >
      <Title
        as="h2"
        id="cart-summary-title"
        className="text-xl font-bold opacity-100"
      >
        Resumen del pedido
      </Title>

      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
        <span>Subtotal</span>
        <span>{totalItems}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
        <span>Envío</span>
        <span>Se calcula después</span>
      </div>
      <hr className="my-0 w-full border-0 border-t border-gray-200" />
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
        to="/checkout"
        className="w-full text-center shadow-sm transition-colors hover:brightness-110"
      >
        Continuar al checkout
      </Button>
      <Link
        to="/restaurantes"
        className="text-center text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
      >
        Seguir explorando
      </Link>
    </aside>
  );
}
