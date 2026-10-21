import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { InitialBanner } from './InitialBanner';
import { RestaurantStatusBadge } from './RestaurantStatusBadge';
import { Loader } from '../ui/Loader';
import { getRestaurantIsOpen, type Restaurant } from '../../services/restaurants';

export type { Restaurant } from '../../services/restaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isElegido?: boolean;
  className?: string;
  onSelect?: () => void;
}

export function RestaurantCard({
  restaurant,
  isElegido = false,
  className = '',
  onSelect,
}: RestaurantCardProps) {
  const navigate = useNavigate();
  const [shouldOpenProfile, setShouldOpenProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantStatus, setRestaurantStatus] = useState<{
    id: string;
    isOpen: boolean | null | undefined;
  }>({ id: restaurant.id, isOpen: undefined });
  const { name, slug, category, initialLetter, image } = restaurant;
  const isSelected = isElegido;
  const isOpen =
    restaurantStatus.id === restaurant.id
      ? restaurantStatus.isOpen
      : undefined;


      //Cuando llega la respuesta, guarda el resultado en restaurantStatus
  useEffect(() => {
    let isCurrent = true;

    getRestaurantIsOpen(restaurant.id)
      .then((status) => {
        if (isCurrent) {
          setRestaurantStatus({ id: restaurant.id, isOpen: status });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          console.error(
            `No se pudo cargar el estado del restaurante ${restaurant.id}.`,
            error,
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [restaurant.id]);

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
    isSelected,
    navigate,
    slug,
    shouldOpenProfile,
  ]);

  function handleSelect() {
    if (!onSelect) return;

    setShouldOpenProfile(!isSelected);
    setIsLoading(false);
    onSelect();
  }

  const isOpeningProfile = isSelected && isLoading;

  const cardStyles = `
    w-full rounded-2xl bg-white font-sans flex flex-col overflow-hidden text-left border border-eco-border transition-all duration-200
    ${isSelected ? 'border-2 border-eco-dark shadow-sm' : 'shadow-sm hover:border-eco-dark hover:shadow-md'}
    ${isOpeningProfile ? 'cursor-wait' : ''}
    ${className}
  `;

  return (
    <button
      type="button"
      className={`${cardStyles} ${onSelect && !isOpeningProfile ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleSelect}
      disabled={!onSelect || isOpeningProfile}
      aria-pressed={onSelect ? isSelected : undefined}
      aria-busy={isOpeningProfile}
    >
      <div className="relative">
        <InitialBanner letter={initialLetter} image={image} isClosed={isOpen === false} />

        {isOpen !== undefined && <RestaurantStatusBadge isOpen={isOpen} />}

        {isSelected && (
          <div className={`absolute right-3 ${isOpen !== undefined ? 'top-12' : 'top-3'}`}>
            <Badge 
              text={isOpeningProfile ? 'Abriendo perfil' : 'Elegido'} 
              className=" bg-eco-dark text-white px-2 py-0.5" 
              icon={isOpeningProfile ? <Loader label="Cargando perfil" /> : <span>✓ </span>}
            />
          </div>
        )}

      </div>

      <div className="p-5 flex flex-col grow justify-between gap-3">
        <div>
          <h4 className="text-xl font-semibold text-eco-dark m-0 leading-snug">
            {name}
          </h4>
          {category && (
            <p className="mt-1 mb-0 text-sm font-medium text-eco-text-secondary">
              {category}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
