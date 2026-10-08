import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Restaurant } from "../services/restaurants";
import { GreenBadge } from "../components/ui/GreenBadge";

const sampleMenu = [
  {
    id: "bowl-estacional",
    name: "Bowl de estación",
    description: "Vegetales de estación, quinoa, hojas frescas y aderezo cítrico.",
    unitPrice: 12.5,
    eco: true,
  },
  {
    id: "tarta-verduras",
    name: "Tarta de verduras asadas",
    description: "Masa casera integral con verduras de productores locales.",
    unitPrice: 10,
    eco: true,
  },
  {
    id: "hamburguesa-lentejas",
    name: "Hamburguesa de lentejas",
    description: "Medallón de lentejas, pan artesanal y vegetales frescos.",
    unitPrice: 13.75,
    eco: false,
  },
];

type DetalleRestaurantePageProps = {
  count: number;
  onAdd: () => void;
};

export function DetalleRestaurantePage({
  count,
  onAdd,
}: DetalleRestaurantePageProps) {
  const { id, slug } = useParams();
  const location = useLocation();
  const restaurant = (
    location.state as { restaurant?: Restaurant } | null
  )?.restaurant;
  const [addedDish, setAddedDish] = useState("");
  const restaurantName =
    restaurant?.name ??
    slug?.replace(/-/g, " ") ??
    id ??
    "Restaurante de ejemplo";

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {restaurant?.imageUrl && (
          <img
            className="aspect-video w-full object-cover"
            src={restaurant.imageUrl}
            alt={restaurant.name}
          />
        )}
        <div className="bg-green-100 px-6 py-10 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Perfil del restaurante · Ejemplo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {restaurantName}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-700">
            Cocina de estación preparada con ingredientes frescos y productos
            de origen local.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-700">
            <span>{restaurant?.cuisine ?? "Comida de estación"}</span>
            <span>
              ★ {restaurant?.rating.toFixed(1) ?? "4.8"} / 5
            </span>
            <span>
              Entrega en {restaurant?.deliveryMinutes ?? 25} min
            </span>
            {restaurant?.ecoLabels?.map((label) => (
              <GreenBadge key={label}>{label}</GreenBadge>
            ))}
          </div>
          <Link
            to="/carrito"
            className="mt-6 inline-flex items-center rounded-full bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
            aria-label={`Ver carrito, ${count} productos`}
          >
            Ver carrito <span className="ml-2 tabular-nums">({count})</span>
          </Link>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
                Menú de muestra
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                Platos para disfrutar
              </h2>
            </div>
          </div>

          <div className="mt-6 divide-y divide-green-100">
            {sampleMenu.map((dish) => (
              <article
                className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                key={dish.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                    {dish.eco && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-900">
                        Opción eco
                      </span>
                    )}
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-gray-600">
                    {dish.description}
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    ${dish.unitPrice.toFixed(2)}
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-full bg-green-800 px-5 py-2.5 font-semibold text-white transition hover:bg-green-900"
                  onClick={() => {
                    onAdd();
                    setAddedDish(dish.name);
                  }}
                  type="button"
                >
                  Agregar al carrito
                </button>
              </article>
            ))}
          </div>
          <p aria-live="polite" className="mt-2 min-h-6 text-sm text-green-800">
            {addedDish ? `${addedDish} agregado al carrito.` : ""}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Menú y precios ilustrativos; se reemplazarán con los datos reales.
          </p>
        </div>
      </section>
    </main>
  );
}
