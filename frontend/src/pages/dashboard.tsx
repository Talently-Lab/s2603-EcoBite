import { Navigate, useParams } from "react-router-dom";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { RestaurantDashboard } from "../components/adminDashboard/RestaurantDashboard";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserDashboardPath,
  getUserSchedulesPath,
} from "../utils/userRoutes";
import { DashboardImpactoPage } from "./dashboardImpacto";

export function DashboardPage() {
  const { user, token } = useAuth();
  const { username } = useParams();

  if (
    user &&
    (!username || getUserDashboardPath(user) !== `/${username}/dashboard`)
  ) {
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

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

export function RestaurantSchedulesRedirect() {
  const { user } = useAuth();
  return user?.rol === "restaurante" ? (
    <Navigate to={getUserSchedulesPath(user)} replace />
  ) : (
    <Navigate to="/" replace />
  );
}
