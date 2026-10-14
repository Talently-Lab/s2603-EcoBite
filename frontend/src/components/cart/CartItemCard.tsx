import { useState } from "react";
import { UtensilsCrossed, X } from "lucide-react";
import type { CartItem } from "../detailRestaurant/OrderSummary";
import { Title } from "../ui/Title";
import QuantitySelector from "./QuantitySelector";

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (
    itemId: CartItem["id"],
    restaurantName: string,
    change: -1 | 1,
  ) => void;
  onRemove: (itemId: CartItem["id"], restaurantName: string) => void;
}

function CartItemImage({
  itemName,
  imageUrl,
}: {
  itemName: string;
  imageUrl?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-eco-light/30 sm:w-28">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={itemName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          aria-label={`Imagen de ${itemName} no disponible`}
          className="flex h-full items-center justify-center text-eco-dark"
        >
          <UtensilsCrossed aria-hidden="true" className="h-8 w-8 opacity-60" />
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number) {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  return (
    <article
      className="
        flex flex-col gap-4 rounded-2xl border border-gray-200
        bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5
      "
    >
      <CartItemImage itemName={item.name} imageUrl={item.imageUrl} />
      <div className="min-w-0 flex-1">
        <Title
          as="h3"
          className="text-md font-bold leading-snug text-gray-900 opacity-100"
        >
          {item.name}
        </Title>
      </div>
      <div className="flex flex-col items-end justify-between gap-3 sm:min-h-28">
        <p className="m-0 font-bold text-eco-dark">
          {formatCurrency(item.price)}
        </p>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end">
          <QuantitySelector
            itemName={item.name}
            quantity={item.quantity}
            onChange={(change) =>
              onQuantityChange(item.id, item.restaurantName, change)
            }
          />
          <button
            type="button"
            aria-label={`Eliminar ${item.name}`}
            onClick={() => onRemove(item.id, item.restaurantName)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
