import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RestaurantList } from "../components/restaurant/RestaurantList";
import Pagination from "../components/restaurant/Pagination";
import { getRestaurants, type Restaurant } from "../services/restaurants";
import { HeroTitle } from "../components/ui/HeroTitle";
import { HeroDescription } from "@/components/ui/HeroDescription";
import { FilterDropdown } from "../components/restaurant/FilterDropDowm";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Loader } from "../components/ui/Loader";

const RESTAURANTS_PER_PAGE = 6;

// Función utilitaria para normalizar texto a slugs de URL
function categoryToSlug(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function RestaurantesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getRestaurants()
      .then((data) => {
        if (isCurrent) {
          setRestaurants(data);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
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
  }, [retryAttempt]);

  function retryLoadingRestaurants() {
    setIsLoading(true);
    setRetryAttempt((attempt) => attempt + 1);
  }
  
  //  Lectura estricta de Query Params desde la URL
  const category = searchParams.get("categoria") ?? "";
  const requestedPage = Number(searchParams.get("page") ?? 1);

  // Validaciones lógicas de la URL
  const validPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const categories = Array.from(
    new Map(
      restaurants
        .flatMap(({ category }) => (category ? [category] : []))
        .map((category) => [categoryToSlug(category), category]),
    ).values(),
  );
  const validCategories = categories.map(categoryToSlug);
  const selectedCategory = validCategories.includes(category) ? category : "";

  // Aplica el filtro de tipo de comida a los restaurantes cargados desde el servicio.
  const filteredRestaurants = restaurants.filter((restaurant) => {
    return (
      !selectedCategory ||
      categoryToSlug(restaurant.category ?? "") === selectedCategory
    );
  });

  // Cálculos de Paginación basados en el resultado ya filtrado
  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / RESTAURANTS_PER_PAGE));
  const currentPage = Math.min(validPage, totalPages);
  const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
  
  const pageRestaurants = filteredRestaurants.slice(startIndex, startIndex + RESTAURANTS_PER_PAGE);

  // Sincronización automática y limpieza de parámetros inválidos en la URL
  useEffect(() => {
    if (isLoading || loadError) return;

    const nextParams = new URLSearchParams(searchParams);
    let shouldReplace = false;

    if (category && !selectedCategory) {
      nextParams.delete("categoria");
      shouldReplace = true;
    }

    if (nextParams.has("envase") || nextParams.has("sin_emisiones")) {
      nextParams.delete("envase");
      nextParams.delete("sin_emisiones");
      shouldReplace = true;
    }

    const pageParam = searchParams.get("page");
    if (pageParam) {
      if (currentPage === 1) {
        nextParams.delete("page");
        shouldReplace = true;
      } else if (pageParam !== String(currentPage)) {
        nextParams.set("page", String(currentPage));
        shouldReplace = true;
      }
    }

    if (shouldReplace) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    category,
    currentPage,
    isLoading,
    loadError,
    searchParams,
    selectedCategory,
    setSearchParams,
  ]);

  // Funciones controladoras (Modifican directamente los Query Params de la URL)
  function updateCategory(nextCategory: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page"); // Resetea la página al filtrar
    if (nextCategory) {
      nextParams.set("categoria", nextCategory);
    } else {
      nextParams.delete("categoria");
    }
    setSearchParams(nextParams);
  }

  function updatePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(nextPage));
    }
    setSearchParams(nextParams);
  }

  function clearAllFilters() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page");
    nextParams.delete("categoria");
    nextParams.delete("envase");
    nextParams.delete("sin_emisiones");
    setSearchParams(nextParams);
  }

  const hasActiveFilters = selectedCategory !== "";

  const categoryOptions = categories.map((cat) => ({
    label: cat,
    value: categoryToSlug(cat),
  }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 font-sans">
      <HeroTitle>Explorar Restaurantes</HeroTitle>
      <HeroDescription className="mt-5">
        Descubrí restaurantes según el tipo de comida.
      </HeroDescription>

      <div className="mt-10 flex flex-col gap-8">
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <FilterDropdown
            label="Tipo de comida"
            value={selectedCategory}
            options={categoryOptions}
            onChange={updateCategory}
          />

          <button
            type="button"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
            className="w-fit text-sm font-bold text-[#042A25] underline bg-transparent border-none text-left cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:no-underline"
          >
            Limpiar filtro
          </button>
        </div>

        <div className="flex w-full flex-col gap-6">
          {/* Contador de locales dinámico según el filtro de la URL */}
          {isLoading || loadError || pageRestaurants.length === 0 ? null : (
            <p className="px-1 text-left text-sm font-semibold text-gray-500">
              {filteredRestaurants.length}{" "}
              {filteredRestaurants.length === 1 ? "local" : "locales"}
            </p>
          )}

          <div>
            {isLoading ? (
              <div
                role="status"
                aria-label="Cargando locales"
                className="flex min-h-[40vh] items-center justify-center"
              >
                <Loader
                  label="Cargando locales"
                  className="justify-center text-eco-dark [&_svg]:h-8 [&_svg]:w-8"
                />
              </div>
            ) : loadError ? (
              <ErrorState
                title="No pudimos cargar los locales"
                description="Revisá tu conexión e intentá de nuevo. Si el problema sigue, volvé a probar en unos minutos."
              >
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    variant="dark"
                    onClick={retryLoadingRestaurants}
                    className="hover:bg-eco-dark/90"
                  >
                    Reintentar
                  </Button>
                  <Button
                    to="/"
                    variant="light"
                    className="bg-eco-white hover:bg-eco-light/70"
                  >
                    Volver al inicio
                  </Button>
                </div>
              </ErrorState>
            ) : pageRestaurants.length > 0 ? (
              <RestaurantList restaurants={pageRestaurants} />
            ) : (
              <EmptyState
                statusLabel="No hay locales disponibles"
                indicatorClassName="!h-[120px] !w-[120px] !border-[3px]"
                indicator={<span aria-hidden="true" className="text-5xl font-light">∅</span>}
                title={
                  hasActiveFilters
                    ? "No encontramos locales con esos filtros"
                    : "No hay locales disponibles"
                }
                description={
                  hasActiveFilters
                    ? "Probá con otro tipo de comida o de envase, o quitá los filtros."
                    : "Vuelve a consultar más tarde para descubrir locales."
                }
              >
                <Button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  variant="dark"
                  className="mx-auto mt-6 inline-flex w-fit justify-center hover:bg-eco-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpiar filtros
                </Button>
              </EmptyState>
            )}
          </div>

          {/* Paginación limpia e independiente en la base */}
          {!isLoading && !loadError && pageRestaurants.length > 0 && (
            <div className="mt-0 flex justify-center border-t-0 pt-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={updatePage}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
