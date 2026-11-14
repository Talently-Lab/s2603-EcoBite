import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { RestaurantSchedulesForm } from "../components/adminDashboard/RestaurantSchedulesForm";
import { useAuth } from "../contexts/AuthContext";
import { getRestaurants } from "../services/restaurants";
import {
  getUserDashboardPath,
  getUserSchedulesPath,
} from "../utils/userRoutes";

export function RestaurantSchedulesPage() {
  const { user, token } = useAuth();
  const { username } = useParams();
  const restaurantUserId =
    user?.rol === "restaurante" ? user.id : undefined;
  const [restaurantId, setRestaurantId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantUserId) return;

    let active = true;

    async function loadRestaurant() {
      setLoading(true);
      setError(null);
      try {
        const restaurants = await getRestaurants();
        const restaurant = restaurants.find(
          (item) => item.userId === restaurantUserId,
        );
        if (!restaurant) {
          throw new Error("No se encontró el restaurante de esta cuenta.");
        }
        if (active) setRestaurantId(Number(restaurant.id));
      } catch (loadError: unknown) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los datos del restaurante.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRestaurant();
    return () => {
      active = false;
    };
  }, [restaurantUserId]);

  if (user?.rol === "cliente") {
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  if (user?.rol === "restaurante" && username !== getUserSchedulesPath(user).split("/")[1]) {
    return <Navigate to={getUserSchedulesPath(user)} replace />;
  }

  if (user?.rol !== "restaurante" || !token) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <GlobalAlert message="Esta página está disponible únicamente para restaurantes." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      {error ? (
        <GlobalAlert message={error} className="mx-auto max-w-2xl" />
      ) : loading ? (
        <p className="py-6 text-center text-sm text-gray-600">
          Cargando los datos del restaurante...
        </p>
      ) : restaurantId ? (
        <RestaurantSchedulesForm restaurantId={restaurantId} token={token} />
      ) : (
        <GlobalAlert
          message="No se pudo identificar el restaurante de esta cuenta."
          className="mx-auto max-w-2xl"
        />
      )}
    </main>
  );
}
