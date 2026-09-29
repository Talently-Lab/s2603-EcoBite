export type Restaurant = {
  id: string
  name: string
  cuisine: string
  rating: number
  deliveryMinutes: number
  imageUrl?: string
  ecoLabels?: string[]
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await fetch('/api/restaurants')

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los restaurantes (${response.status})`)
  }

  return response.json() as Promise<Restaurant[]>
}