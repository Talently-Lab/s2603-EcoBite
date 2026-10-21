import { MOCK_PRODUCTS, MOCK_RESTAURANTS } from "./restaurants.mock";

export interface RestaurantApiResponse {
  id: number;
  id_usuario: number;
  nombre: string;
  telefono: string | null;
  cuit: string | null;
  direccion: string | null;
  descripcion: string | null;
  categoria: string | null;
  ciudad: string | null;
  imagen: string | null;
}

export interface RestaurantProductApiResponse {
  id: number;
  id_restaurante: number;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  disponible: boolean;
  categoria: string | null;
  imagen: string | null;
}

export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  classification: string;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  userId?: number;
  name: string;
  phone?: string | null;
  cuitId?: string | null;
  address?: string | null;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  city?: string | null;
  initialLetter: string;
}

export interface RestaurantMenu {
  dishes: MenuItemData[];
  drinks: MenuItemData[];
}

interface RestaurantStatusApiResponse {
  abierto: boolean;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

const USE_MOCK_DATA = import.meta.env.VITE_DATA_SOURCE !== "api";

class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

// Transform API data (Spanish) into the frontend model (English).
function mapRestaurant(data: RestaurantApiResponse): Restaurant {
  const slug = data.nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: String(data.id),
    slug,
    userId: data.id_usuario,
    name: data.nombre,
    phone: data.telefono,
    cuitId: data.cuit,
    address: data.direccion,
    description: data.descripcion,
    image: data.imagen,
    category: data.categoria,
    city: data.ciudad,
    initialLetter: data.nombre.charAt(0).toUpperCase(),
  };
}

function getMockRestaurantBySlug(slug: string): Restaurant | undefined {
  return MOCK_RESTAURANTS.map(mapRestaurant).find(
    (restaurant) => restaurant.slug === slug,
  );
}

async function fetchApi<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiRequestError(
      `La solicitud falló con estado ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

// GET http://localhost:3000/api/restaurantes
export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    if (USE_MOCK_DATA) {
      return MOCK_RESTAURANTS.map(mapRestaurant);
    }

    const restaurants =
      await fetchApi<RestaurantApiResponse[]>("/restaurantes");

    return restaurants.map(mapRestaurant);
  } catch (error) {
    if (!USE_MOCK_DATA && error instanceof TypeError) {
      const connectionError = new Error(
        "No se pudo conectar cargar los restarunates. ",
        { cause: error },
      );
      console.error(connectionError.message, error);
      throw connectionError;
    }

    console.error("No se pudieron cargar los restaurantes.", error);
    throw new Error("Error al cargar restaurantes.", { cause: error });
  }
}

// GET http://localhost:3000/api/restaurantes/:id/estado
// Ejemplo: http://localhost:3000/api/restaurantes/1/estado
export async function getRestaurantIsOpen(
  restaurantId: string,
): Promise<boolean | null> {
  if (USE_MOCK_DATA) {
    return null;
  }

  const status = await fetchApi<RestaurantStatusApiResponse>(
    `/restaurantes/${encodeURIComponent(restaurantId)}/estado`,
  );

  if (typeof status.abierto !== "boolean") {
    throw new Error("La API devolvió un estado de restaurante inválido.");
  }

  return status.abierto;
}

// En modo API reutiliza GET http://localhost:3000/api/restaurantes
// y busca el restaurante por slug en el frontend.
export async function getRestaurantBySlug(
  slug: string,
): Promise<Restaurant> {
  if (USE_MOCK_DATA) {
    const restaurant = getMockRestaurantBySlug(slug);

    if (!restaurant) {
      throw new Error("No se encontró el restaurante solicitado.");
    }

    return restaurant;
  }

  const restaurants = await getRestaurants();
  const restaurant = restaurants.find((item) => item.slug === slug);

  if (!restaurant) {
    throw new Error("No se encontró el restaurante solicitado.");
  }

  return restaurant;
}

// Intenta GET http://localhost:3000/api/restaurants/:slug/menu.
// Esta ruta no existe en el backend actual; el menú solo funciona en modo mock.
export async function getRestaurantMenu(
  slug: string,
): Promise<RestaurantMenu> {
  if (USE_MOCK_DATA) {
    const restaurant = MOCK_RESTAURANTS.map(mapRestaurant).find(
      (item) => item.slug === slug,
    );

    if (!restaurant) {
      throw new Error("No se encontró el restaurante solicitado.");
    }

    const products = MOCK_PRODUCTS.filter(
      (product) =>
        product.id_restaurante === Number(restaurant.id) &&
        product.disponible,
    ).map((product) => ({
      id: String(product.id),
      name: product.nombre,
      description: product.descripcion ?? "",
      price: Number(product.precio),
      classification: product.categoria ?? "",
      imageUrl: product.imagen ?? undefined,
    }));

    return {
      dishes: products.filter(
        (product) => product.classification !== "Bebidas",
      ),
      drinks: products.filter(
        (product) => product.classification === "Bebidas",
      ),
    };
  }

  try {
    return await fetchApi<RestaurantMenu>(
      `/restaurants/${encodeURIComponent(slug)}/menu`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return { dishes: [], drinks: [] };
    }

    if (error instanceof TypeError) {
      const connectionError = new Error(
        "No se pudo conectar con la API para cargar el menú. Verificá que el backend esté iniciado y que VITE_API_URL sea correcta.",
        { cause: error },
      );
      console.error(connectionError.message, error);
      throw connectionError;
    }

    console.error("No se pudo cargar el menú desde la API.", error);
    throw error;
  }
}
