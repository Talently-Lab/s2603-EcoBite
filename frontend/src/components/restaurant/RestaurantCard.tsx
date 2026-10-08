import type { Restaurant } from '../../services/restaurants'
import { GreenBadge } from '../ui/GreenBadge'
import { Link } from 'react-router-dom'

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type RestaurantCardProps = {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurantes/${toSlug(restaurant.name)}`}
      state={{ restaurant }}
      aria-label={`Ver perfil de ${restaurant.name}`}
      className="block overflow-hidden rounded-lg border border-green-200 bg-white transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
    >
      <article>
        {restaurant.imageUrl ? (
          <img className="aspect-video w-full object-cover" src={restaurant.imageUrl} alt="" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-green-100 text-sm font-medium text-gray-600">
            Imagen del restaurante
          </div>
        )}
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-800">{restaurant.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{restaurant.cuisine}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gray-800" aria-label={`Calificacion ${restaurant.rating} de 5`}>
              {restaurant.rating.toFixed(1)} / 5
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{restaurant.deliveryMinutes} min</span>
            {restaurant.ecoLabels?.map((label: string) => <GreenBadge key={label}>{label}</GreenBadge>)}
          </div>
        </div>
      </article>
    </Link>
  )
}
