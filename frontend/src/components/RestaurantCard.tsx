import type { Restaurant } from '../services/restaurants'
import { GreenBadge } from './GreenBadge'

type RestaurantCardProps = {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#dce5d8] bg-white">
      {restaurant.imageUrl ? (
        <img className="aspect-[16/9] w-full object-cover" src={restaurant.imageUrl} alt="" />
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-[#e6eee0] text-sm font-medium text-[#526357]">
          Imagen del restaurante
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[#1f2b22]">{restaurant.name}</h2>
            <p className="mt-1 text-sm text-[#647267]">{restaurant.cuisine}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-[#1f2b22]" aria-label={`Calificacion ${restaurant.rating} de 5`}>
            {restaurant.rating.toFixed(1)} / 5
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#647267]">
          <span>{restaurant.deliveryMinutes} min</span>
          {restaurant.ecoLabels?.map((label) => <GreenBadge key={label}>{label}</GreenBadge>)}
        </div>
      </div>
    </article>
  )
}