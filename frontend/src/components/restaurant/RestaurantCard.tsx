import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { InitialBanner } from './InitialBanner';
import { Leaf } from 'lucide-react';
import { Loader } from '../ui/Loader';
import type { Restaurant } from '../../services/restaurants';

export type { Restaurant } from '../../services/restaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isElegido?: boolean;
  isCerrado?: boolean;
  openingTime?: string;
  className?: string;
  onSelect?: () => void;
}

export function RestaurantCard({
  restaurant,
  isElegido = false,
  isCerrado = restaurant.isClosed ?? false,
  openingTime = restaurant.openingTime,
  className = '',
  onSelect,
}: RestaurantCardProps) {
  const navigate = useNavigate();
  const [shouldOpenProfile, setShouldOpenProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { name, slug, cuisine, deliveryTime, tag, initialLetter } = restaurant;
  const isSelected = isElegido && !isCerrado;

  useEffect(() => {
    if (!shouldOpenProfile || !isSelected) {
      return;
    }

    let navigationTimeout: number | undefined;
    const loaderTimeout = window.setTimeout(() => {
      setIsLoading(true);
      navigationTimeout = window.setTimeout(() => {
        navigate(`/restaurantes/${slug}`);
      }, 650);
    }, 2000);

    return () => {
      window.clearTimeout(loaderTimeout);
      if (navigationTimeout !== undefined) {
        window.clearTimeout(navigationTimeout);
      }
    };
  }, [
    cuisine,
    deliveryTime,
    isSelected,
    navigate,
    slug,
    shouldOpenProfile,
  ]);

  function handleSelect() {
    if (isCerrado || !onSelect) return;

    setShouldOpenProfile(!isSelected);
    setIsLoading(false);
    onSelect();
  }

  const isOpeningProfile = isSelected && isLoading;

  const cardStyles = `
    w-full rounded-2xl bg-white font-sans flex flex-col overflow-hidden text-left border transition-all duration-200
    ${isCerrado ? 'pointer-events-none opacity-60' : ''}
    ${isSelected ? 'border-4 border-eco-dark shadow-sm' : 'border-gray-100 shadow-sm hover:border-eco-dark hover:shadow-md'}
    ${isOpeningProfile ? 'cursor-wait' : ''}
    ${className}
  `;

  return (
    <button
      type="button"
      className={`${cardStyles} ${onSelect && !isCerrado && !isOpeningProfile ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleSelect}
      disabled={!onSelect || isCerrado || isOpeningProfile}
      aria-pressed={onSelect ? isSelected : undefined}
      aria-busy={isOpeningProfile}
    >
      <div className="relative">
        <InitialBanner letter={initialLetter} />

        {isSelected && (
          <div className="absolute top-3 right-3">
            <Badge 
              text={isOpeningProfile ? 'Abriendo perfil' : 'Elegido'} 
              className=" bg-eco-dark text-white px-2 py-0.5" 
              icon={isOpeningProfile ? <Loader label="Cargando perfil" /> : <span>✓ </span>}
            />
          </div>
        )}

        {isCerrado && (
          <div className="absolute top-3 right-3">
            <Badge 
              text="Cerrado ahora" 
              className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5" 
              icon={null}
            />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col grow justify-between gap-3">
        <div>
          <h4 className="text-md font-bold text-gray-900 m-0 leading-snug">
            {name}
          </h4>
          
          <p className="text-xs mt-1 mb-0 font-medium text-gray-500">
            {isCerrado && openingTime ? openingTime : `${cuisine} • ${deliveryTime}`}
          </p>
        </div>

        {tag && (
          <Badge 
            text={tag}
            className="bg-eco-light text-eco-dark"
            icon={<Leaf className="h-3.5 w-3.5" />}
          />
        )}
      </div>
    </button>
  );
}