import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RestaurantList } from "../components/restaurant/RestaurantList";
import Pagination from "../components/restaurant/Pagination";
import { getRestaurants, type Restaurant } from "../services/restaurants";
import { HeroTitle } from "../components/ui/HeroTitle";
import { HeroDescription } from "@/components/ui/HeroDescription";
import { FilterDropdown } from "../components/restaurant/FilterDropDowm";
import { FilterToggle } from "../components/restaurant/FilterToggle";

const RESTAURANTS_PER_PAGE = 3;

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

  useEffect(() => {
    let isCurrent = true;

    getRestaurants()
      .then((data) => {
        if (isCurrent) setRestaurants(data);
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
  }, []);
  
  //  Lectura estricta de Query Params desde la URL
  const category = searchParams.get("categoria") ?? "";
  const envase = searchParams.get("envase") ?? "";
  const sinEmisiones = searchParams.get("sin_emisiones") === "true";
  const requestedPage = Number(searchParams.get("page") ?? 1);

  // Validaciones lógicas de la URL
  const validPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const categories = [...new Set(restaurants.map(({ cuisine }) => cuisine))];
  const validCategories = categories.map(categoryToSlug);
  const selectedCategory = validCategories.includes(category) ? category : "";

  // Aplica los filtros de la URL a los restaurantes cargados desde el servicio.
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filtro por Categoría
    const matchesCategory = !selectedCategory || categoryToSlug(restaurant.cuisine) === selectedCategory;
    
    // Filtro por tipo de envase
    const matchesEnvase = !envase || restaurant.tag?.toLowerCase().includes(envase.toLowerCase());
    
    // Filtro por las etiquetas ecológicas del restaurante
    const matchesEmisiones =
      !sinEmisiones || restaurant.ecoLabels?.includes("sin-emisiones") === true;

    return matchesCategory && matchesEnvase && matchesEmisiones;
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

  function updateEnvase(nextEnvase: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page");
    if (nextEnvase) {
      nextParams.set("envase", nextEnvase);
    } else {
      nextParams.delete("envase");
    }
    setSearchParams(nextParams);
  }

  function toggleEmisiones() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page");
    if (!sinEmisiones) {
      nextParams.set("sin_emisiones", "true");
    } else {
      nextParams.delete("sin_emisiones");
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

  // Constantes auxiliares para pasarle a los componentes Dropdown de la UI
  const hasActiveFilters = selectedCategory !== "" || envase !== "" || sinEmisiones;

  const categoryOptions = categories.map((cat) => ({
    label: cat,
    value: categoryToSlug(cat),
  }));

  const envaseOptions = [
    { label: "Biodegradable", value: "biodegradable" },
    { label: "Retornable", value: "retornable" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 font-sans">
      <HeroTitle>Explorar Restaurantes</HeroTitle>
      <HeroDescription className="mt-5">
        Locales con envases biodegradables y transporte sin emisiones
      </HeroDescription>

      <div className="mt-10 flex flex-col gap-8">
        <div className="grid w-full grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(15rem,1.4fr)_auto] lg:items-center">
          <FilterDropdown
            label="Tipo de comida"
            value={selectedCategory}
            options={categoryOptions}
            onChange={updateCategory}
          />

          <FilterDropdown
            label="Tipo de envase"
            value={envase}
            options={envaseOptions}
            onChange={updateEnvase}
          />

          <FilterToggle
            label="Con transporte sin emisiones"
            isActive={sinEmisiones}
            onClick={toggleEmisiones}
          />

          <button
            type="button"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
            className="w-fit text-sm font-bold text-[#042A25] underline bg-transparent border-none text-left cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:no-underline"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex w-full flex-col gap-6">
          {/* Contador de locales dinámico según el filtro de la URL */}
          {isLoading ? (
            <p className="px-1 text-sm text-gray-600">Cargando restaurantes...</p>
          ) : loadError ? (
            <p role="alert" className="px-1 text-sm text-red-700">
              {loadError}
            </p>
          ) : (
            <p className="px-1 text-left text-sm font-semibold text-gray-500">
              {filteredRestaurants.length}{" "}
              {filteredRestaurants.length === 1 ? "local" : "locales"}
            </p>
          )}

          <div>
            {isLoading || loadError ? null : pageRestaurants.length > 0 ? (
              <RestaurantList restaurants={pageRestaurants} />
            ) : (
              <p className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-500 font-medium shadow-sm">
                No hay restaurantes que coincidan con los filtros seleccionados.
              </p>
            )}
          </div>

          {/* Paginación limpia e independiente en la base */}
          {!isLoading && !loadError && (
            <div className="mt-6 flex justify-center border-t border-gray-100 pt-8">
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