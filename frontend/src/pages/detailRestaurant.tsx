import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HeroTitle } from "../components/ui/HeroTitle";
import { HeroDescription } from "../components/ui/HeroDescription";
import { MenuItem } from "../components/detailRestaurant/menuItem";
import { RestaurantInfoTags } from "../components/detailRestaurant/RestaurantInfoTags";
import {
  OrderSummary,
  type CartItem,
} from "../components/detailRestaurant/OrderSummary";
import {
  getRestaurantBySlug,
  getRestaurantMenu,
  type MenuItemData,
  type Restaurant,
  type RestaurantMenu,
} from "../services/restaurants";

type DetalleRestaurantePageProps = {
  items: CartItem[];
  onAdd: (item: MenuItemData) => void;
};

export function DetalleRestaurantePage({
  items,
  onAdd,
}: DetalleRestaurantePageProps) {
  const { slug } = useParams();
  const [loadedData, setLoadedData] = useState<{
    slug: string;
    restaurant: Restaurant;
    menu: RestaurantMenu;
  } | null>(null);
  const [loadError, setLoadError] = useState<{
    slug: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;

    let isCurrent = true;

    Promise.all([getRestaurantBySlug(slug), getRestaurantMenu(slug)])
      .then(([restaurantData, menuData]) => {
        if (!isCurrent) return;
        setLoadedData({
          slug,
          restaurant: restaurantData,
          menu: menuData,
        });
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError({
            slug,
            message:
              error instanceof Error
                ? error.message
                : "No se pudo cargar el restaurante.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  if (!slug) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <p role="alert" className="text-red-700">
          No se indicó qué restaurante se quiere consultar.
        </p>
      </main>
    );
  }

  const currentData = loadedData?.slug === slug ? loadedData : null;
  const currentError = loadError?.slug === slug ? loadError.message : null;

  if (!currentData && !currentError) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <p role="status">Cargando restaurante...</p>
      </main>
    );
  }

  if (currentError || !currentData) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <p role="alert" className="text-red-700">
          {currentError ?? "No se pudo cargar el restaurante."}
        </p>
      </main>
    );
  }

  const { restaurant, menu } = currentData;
  const restaurantDetails = [
    restaurant.cuisine,
    ...(restaurant.deliveryMinutes
      ? [`Entrega: ${restaurant.deliveryMinutes} min`]
      : []),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 font-sans sm:px-8 sm:py-12">
      <section
        aria-label={`Banner de ${restaurant.name}`}
        className="relative min-h-48 overflow-hidden rounded-2xl bg-eco-light sm:min-h-64"
      >
        {restaurant.imageUrl && (
          <img
            src={restaurant.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </section>

      <section className="mt-8 flex flex-col items-start gap-5">
        <div className="flex flex-col gap-3">
          <HeroTitle>{restaurant.name}</HeroTitle>
          <HeroDescription>
            Conocé el menú y elegí tus platos favoritos.
          </HeroDescription>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-gray-600">
          {restaurantDetails.map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
        <div>
          <RestaurantInfoTags labels={restaurant.ecoLabels} />
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <section aria-labelledby="main-dishes-title">
            <h2
              id="main-dishes-title"
              className="text-2xl font-bold text-eco-dark"
            >
              Platos principales
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5">
              {menu.dishes.length > 0 ? (
                menu.dishes.map((dish) => (
                  <MenuItem key={dish.id} item={dish} onAdd={onAdd} />
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  Este restaurante todavía no publicó platos principales.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="drinks-title" className="mt-12">
            <h2 id="drinks-title" className="text-2xl font-bold text-eco-dark">
              Bebidas
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5">
              {menu.drinks.length > 0 ? (
                menu.drinks.map((drink) => (
                  <MenuItem key={drink.id} item={drink} onAdd={onAdd} />
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  Este restaurante todavía no publicó bebidas.
                </p>
              )}
            </div>
          </section>
        </div>

        <OrderSummary items={items} />
      </div>
    </main>
  );
}
