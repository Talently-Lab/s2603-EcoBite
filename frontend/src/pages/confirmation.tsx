import { useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import { ImpactBadge } from "../components/ui/ImpactBadge";
import type { CartItem } from "../components/detailRestaurant/OrderSummary";
import { ComparisonChart } from "../components/confirm/ComparisonChart";
import { OrderDetails } from "../components/confirm/OrderDetails";
import { SuccessIndicator } from "../components/confirm/SuccessIndicator";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrdersPath } from "../utils/userRoutes";

interface ConfirmacionPageProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

export function ConfirmacionPage({
  items,
  savedCo2Kg,
}: ConfirmacionPageProps) {
  const { user } = useAuth();
  const location = useLocation();
  const confirmationState = location.state as {
    items?: CartItem[];
    savedCo2Kg?: number | null;
  } | null;
  const orderItems = confirmationState?.items ?? items;
  const confirmedCo2Saved =
    typeof confirmationState?.savedCo2Kg === "number" &&
    Number.isFinite(confirmationState.savedCo2Kg)
      ? confirmationState.savedCo2Kg
      : savedCo2Kg;
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <SuccessIndicator />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <OrderDetails items={orderItems} />
        <div className="flex flex-col gap-6">
          <ImpactBadge
            titulo="Ahorraste con este pedido"
            savedCo2Kg={confirmedCo2Saved}
            descripcion="Impacto ambiental de tu pedido"
          />
          <ComparisonChart />
        </div>
      </div>
      <div className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button
          to="/dashboard"
          className="block w-full text-center shadow-sm transition-colors hover:brightness-110"
        >
          Ver mi dashboard de impacto
        </Button>
        <Button
          to={user ? getUserOrdersPath(user) : "/login"}
          variant="light"
          className="block w-full bg-white text-center transition-colors hover:bg-eco-light/20"
        >
          Ver mis pedidos
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
