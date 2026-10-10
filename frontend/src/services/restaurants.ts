export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  classification: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  deliveryTime: string;
  deliveryMinutes: number;
  rating: number;
  imageUrl?: string;
  tag?: string;
  ecoLabels?: string[];
  initialLetter: string;
  isClosed?: boolean;
  openingTime?: string;
}

export interface RestaurantMenu {
  dishes: MenuItemData[];
  drinks: MenuItemData[];
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");
const USE_MOCK_DATA = import.meta.env.VITE_DATA_SOURCE !== "api";

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    slug: "verde-raiz",
    name: "Verde Raíz",
    cuisine: "Cocina natural",
    deliveryTime: "25-35 min",
    deliveryMinutes: 25,
    rating: 4.8,
    tag: "Envase biodegradable",
    ecoLabels: ["biodegradable", "sin-emisiones", "ahorro-co2"],
    initialLetter: "V",
  },
  {
    id: "2",
    slug: "hoja-y-fuego",
    name: "Hoja y Fuego",
    cuisine: "Parrilla vegetal",
    deliveryTime: "30-40 min",
    deliveryMinutes: 30,
    rating: 4.6,
    tag: "Envase biodegradable",
    ecoLabels: ["biodegradable"],
    initialLetter: "H",
  },
  {
    id: "3",
    slug: "brote-cocina-viva",
    name: "Brote Cocina Viva",
    cuisine: "Vegana",
    deliveryTime: "20-30 min",
    deliveryMinutes: 20,
    rating: 4.7,
    tag: "Envase biodegradable",
    ecoLabels: ["biodegradable"],
    initialLetter: "B",
  },
  {
    id: "4",
    slug: "raices-ancestrales",
    name: "Raíces Ancestrales",
    cuisine: "Orgánica",
    deliveryTime: "40-50 min",
    deliveryMinutes: 40,
    rating: 4.5,
    tag: "Envase biodegradable",
    ecoLabels: ["biodegradable"],
    initialLetter: "R",
    isClosed: true,
    openingTime: "Abre a las 19:00",
  },
];

const MOCK_MENU: RestaurantMenu = {
  dishes: [
    {
      id: "bowl-estacional",
      name: "Bowl de estación",
      description: "Quinoa, vegetales frescos y aderezo cítrico.",
      price: 12.5,
      classification: "Envase biodegradable",
    },
    {
      id: "tarta-verduras",
      name: "Tarta de verduras asadas",
      description: "Masa integral casera con verduras de productores locales.",
      price: 10,
      classification: "Envase biodegradable",
    },
    {
      id: "hamburguesa-lentejas",
      name: "Hamburguesa de lentejas",
      description: "Lentejas, pan artesanal y vegetales frescos.",
      price: 13.75,
      classification: "Envase biodegradable",
    },
  ],
  drinks: [
    {
      id: "limonada-menta",
      name: "Limonada con menta",
      description: "Limones frescos y menta.",
      price: 4.5,
      classification: "Envase biodegradable",
    },
    {
      id: "jugo-estacional",
      name: "Jugo de estación",
      description: "Frutas de estación, exprimidas al momento.",
      price: 5,
      classification: "Envase biodegradable",
    },
  ],
};

async function fetchApi<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`La solicitud falló con estado ${response.status}.`);
  }
  return (await response.json()) as T;
}

export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    if (USE_MOCK_DATA) return MOCK_RESTAURANTS;
    return await fetchApi<Restaurant[]>("/restaurants");
  } catch (error) {
    console.error("No se pudieron cargar los restaurantes.", error);
    throw new Error("Error al cargar restaurantes.", { cause: error });
  }
}

export async function getRestaurantBySlug(
  slug: string,
): Promise<Restaurant> {
  if (USE_MOCK_DATA) {
    const restaurant = MOCK_RESTAURANTS.find((item) => item.slug === slug);
    if (!restaurant) {
      throw new Error("No se encontró el restaurante solicitado.");
    }
    return restaurant;
  }
  return fetchApi<Restaurant>(`/restaurants/${encodeURIComponent(slug)}`);
}

export async function getRestaurantMenu(
  slug: string,
): Promise<RestaurantMenu> {
  if (USE_MOCK_DATA) {
    const restaurant = await getRestaurantBySlug(slug);
    return restaurant.slug === "verde-raiz"
      ? MOCK_MENU
      : { dishes: [], drinks: [] };
  }
  return fetchApi<RestaurantMenu>(
    `/restaurants/${encodeURIComponent(slug)}/menu`,
  );
}
