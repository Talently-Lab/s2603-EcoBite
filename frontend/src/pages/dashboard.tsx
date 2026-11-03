import { GlobalAlert } from "../components/ui/GlobalAlert";
import { RestaurantDashboard } from "../components/adminDashboard/RestaurantDashboard";
import { useAuth } from "../contexts/AuthContext";
import { DashboardImpactoPage } from "./dashboardImpacto";

export function DashboardPage() {
  const { user, token } = useAuth();

  if (user?.rol === "cliente") {
    return <DashboardImpactoPage />;
  }
  if (user?.rol === "restaurante" && token) {
    return <RestaurantDashboard token={token} restaurantUserId={user.id} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <GlobalAlert message="Tu cuenta no tiene un rol habilitado para este dashboard." />
    </main>
  );
}
