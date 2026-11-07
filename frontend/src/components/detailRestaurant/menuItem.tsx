import { useState } from "react";
import { Leaf, UtensilsCrossed } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Title } from "../ui/Title";
import type { MenuItemData } from "../../services/restaurants";

export type { MenuItemData } from "../../services/restaurants";

interface MenuItemProps {
  item: MenuItemData;
  onAdd: (item: MenuItemData) => void;
  canAddToCart: boolean;
}

export function MenuItem({ item, onAdd, canAddToCart }: MenuItemProps) {
  const canOrder = canAddToCart && item.available;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="flex flex-col items-stretch gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div
        aria-label={`Imagen de ${item.name}`}
        className="flex h-36 w-full shrink-0 items-center justify-center rounded-xl bg-eco-light/30 text-eco-dark sm:h-28 sm:w-28"
      >
        {item.imageUrl && !imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full rounded-xl object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <UtensilsCrossed aria-hidden="true" className="h-8 w-8 opacity-60" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Title className="text-base opacity-100">{item.name}</Title>
        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
        <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="font-bold text-eco-dark">
            ${item.price.toFixed(2)}
          </span>
          <Badge
            text={item.classification}
            className="bg-eco-light text-eco-dark"
            icon={<Leaf className="h-3.5 w-3.5" />}
          />
          {!item.available && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
              No disponible
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center justify-center gap-2 sm:items-start">
        <Button
          onClick={() => onAdd(item)}
          disabled={!canOrder}
          title={
            !item.available
              ? "Este producto no está disponible en este momento."
              : canAddToCart
                ? undefined
                : "Iniciá sesión con una cuenta de cliente para agregar productos."
          }
          className="cursor-pointer shadow-sm transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
        >
          Agregar
        </Button>
        {!item.available ? (
          <span className="max-w-40 text-center text-xs text-gray-600 sm:text-left">
            No disponible por el momento.
          </span>
        ) : !canAddToCart ? (
          <span className="max-w-40 text-center text-xs text-gray-600 sm:text-left">
            Solo clientes pueden agregar productos.
          </span>
        ) : null}
      </div>
    </article>
  );
}
