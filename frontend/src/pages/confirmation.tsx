import Button from "../components/ui/Button";
import { ImpactBadge } from "../components/ui/ImpactBadge";
import type { CartItem } from "../components/detailRestaurant/OrderSummary";
import { ComparisonChart } from "../components/confirm/ComparisonChart";
import { OrderDetails } from "../components/confirm/OrderDetails";
import { SuccessIndicator } from "../components/confirm/SuccessIndicator";

interface ConfirmacionPageProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

export function ConfirmacionPage({
  items,
  savedCo2Kg,
}: ConfirmacionPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <SuccessIndicator />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <OrderDetails items={items} />
        <div className="flex flex-col gap-6">
          <ImpactBadge
            titulo="Ahorraste con este pedido"
            savedCo2Kg={savedCo2Kg}
            descripcion="Impacto ambiental de tu pedido"
          />
          <ComparisonChart />
        </div>
      </div>
      <div className="mx-auto mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          to="/dashboard"
          className="block w-full text-center shadow-sm transition-colors hover:brightness-110"
        >
          Ver mi dashboard de impacto
        </Button>
        <Button
          to="/"
          variant="light"
          className="bg-white block w-full text-center transition-colors hover:bg-eco-light/20"
        >
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}
