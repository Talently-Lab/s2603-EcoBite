import { useState } from 'react';
import { RestaurantCard } from './RestaurantCard';
import type { Restaurant } from '../../services/restaurants';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<Restaurant['id'] | null>(null);

  return (
    // Reacomoda la grilla: 1 columna en móvil, 2 en tablets y 3 en desktop
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard 
          key={restaurant.id} 
          restaurant={restaurant}
          isElegido={restaurant.id === selectedRestaurantId}
          onSelect={() =>
            setSelectedRestaurantId((selectedId) =>
              selectedId === restaurant.id ? null : restaurant.id
            )
          }
        />
      ))}
    </div>
  );
}