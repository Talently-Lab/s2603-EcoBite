  // {
  //   "id": 1,
  //   "id_usuario": 5,
  //   "nombre": "Verde Raiz",
  //   "telefono": "2664000005",
  //   "cuit": "30-71234567-8",
  //   "direccion": "Av. Illia 250",
  //   "descripcion": "Comida natural y saludable",
  //   "categoria": "Cocina natural",
  //   "ciudad": "San Luis",
  //   "hora_apertura": null,
  //   "hora_cierre": null
  // },
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
  hora_apertura?: string | null;
  hora_cierre?: string | null;
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
  category?: string | null;
  city?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  initialLetter: string;
}

export interface RestaurantMenu {
  dishes: MenuItemData[];
  drinks: MenuItemData[];
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
    category: data.categoria,
    city: data.ciudad,
    openingTime: data.hora_apertura,
    closingTime: data.hora_cierre,
    initialLetter: data.nombre.charAt(0).toUpperCase(),
  };
}

const MOCK_RESTAURANTS: RestaurantApiResponse[] = [
  {
    id: 1,
    id_usuario: 5,
    nombre: "Verde Raiz",
    telefono: "2664000005",
    cuit: "30-71234567-8",
    direccion: "Av. Illia 250",
    descripcion: "Comida natural y saludable",
    categoria: "Cocina natural",
    ciudad: "San Luis",
    hora_apertura: null,
    hora_cierre: null,
  },
  {
    id: 2,
    id_usuario: 6,
    nombre: "Hoja y Fuego",
    telefono: "2664000006",
    cuit: "30-79876543-2",
    direccion: "Calle Colon 580",
    descripcion: "Propuesta de cocina vegetal",
    categoria: "Parrilla vegetal",
    ciudad: "San Luis",
    hora_apertura: null,
    hora_cierre: null,
  },
];

const MOCK_MENUS: Record<string, RestaurantMenu> = {
  "verde-raiz": {
    dishes: [
      {
        id: "1",
        name: "Bowl de quinoa",
        description: "Quinoa, vegetales frescos y aderezo de la casa",
        price: 8500,
        classification: "Comida",
        imageUrl: "bowl_quinoa.jpg",
      },
      {
        id: "2",
        name: "Ensalada mediterránea",
        description: "Vegetales frescos, aceitunas y semillas",
        price: 7200,
        classification: "Comida",
        imageUrl: "ensalada_mediterranea.jpg",
      },
    ],
    drinks: [
      {
        id: "3",
        name: "Limonada natural",
        description: "Limonada casera con limón fresco",
        price: 3000,
        classification: "Bebidas",
        imageUrl: "limonada.jpg",
      },
    ],
  },
  "hoja-y-fuego": {
    dishes: [
      {
        id: "4",
        name: "Parrillada vegetal",
        description: "Vegetales grillados de temporada",
        price: 9500,
        classification: "Comida",
        imageUrl: "parrillada_vegetal.jpg",
      },
      {
        id: "5",
        name: "Hamburguesa vegetal",
        description: "Hamburguesa vegetal con pan artesanal",
        price: 8000,
        classification: "Comida",
        imageUrl: "hamburguesa_vegetal.jpg",
      },
    ],
    drinks: [
      {
        id: "6",
        name: "Jugo natural",
        description: "Jugo natural de frutas de temporada",
        price: 3200,
        classification: "Bebidas",
        imageUrl: "jugo_natural.jpg",
      },
    ],
  },
};

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
      console.warn(
        "La API no está disponible; se usarán los restaurantes de muestra.",
        error,
      );
      return MOCK_RESTAURANTS.map(mapRestaurant);
    }

    console.error("No se pudieron cargar los restaurantes.", error);
    throw new Error("Error al cargar restaurantes.", { cause: error });
  }
}

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

export async function getRestaurantMenu(
  slug: string,
): Promise<RestaurantMenu> {
  if (USE_MOCK_DATA) {
    if (!getMockRestaurantBySlug(slug)) {
      throw new Error("No se encontró el restaurante solicitado.");
    }
    return MOCK_MENUS[slug] ?? { dishes: [], drinks: [] };
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
      console.warn(
        "La API no está disponible; se usará el menú de muestra.",
        error,
      );
      if (!getMockRestaurantBySlug(slug)) {
        throw new Error("No se encontró el restaurante solicitado.", {
          cause: error,
        });
      }
      return MOCK_MENUS[slug] ?? { dishes: [], drinks: [] };
    }

    throw error;
  }
}