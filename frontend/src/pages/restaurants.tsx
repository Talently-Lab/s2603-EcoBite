import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import type { Restaurant } from "../services/restaurants";

const exampleRestaurant: Restaurant = {
  id: "restaurante-ejemplo",
  name: "Restaurante de ejemplo",
  cuisine: "Comida de estación",
  rating: 4.8,
  deliveryMinutes: 25,
  ecoLabels: ["Opción eco"],
};

export function RestaurantesPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
        Restaurantes
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Vista previa con datos de ejemplo; se reemplazarán al conectar la API.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RestaurantCard restaurant={exampleRestaurant} />
      </div>
    </main>
  );
}
