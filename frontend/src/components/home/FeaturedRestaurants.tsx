import { useEffect, useState } from "react";
import { SectionHeader } from "../ui/SectionHeader";
import { RestaurantList } from "../restaurant/RestaurantList";
import { getRestaurants, type Restaurant } from "../../services/restaurants";

export default function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getRestaurants()
      .then((data) => {
        if (isCurrent) setRestaurants(data);
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los restaurantes.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="w-full py-6 font-sans">
      <div className="mx-auto w-full max-w-7xl px-6">
        <SectionHeader
          titleText="Restaurantes destacados"
          viewAllHref="/restaurantes"
        />

        {error ? (
          <p role="alert" className="text-sm text-red-700">{error}</p>
        ) : isLoading ? (
          <p className="text-sm text-gray-600">Cargando restaurantes...</p>
        ) : restaurants.length > 0 ? (
          <RestaurantList restaurants={restaurants.slice(0, 3)} />
        ) : (
          <p className="text-sm text-gray-600">No hay restaurantes para mostrar.</p>
        )}
      </div>
    </section>
  );
}