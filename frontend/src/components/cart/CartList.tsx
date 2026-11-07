import type { CartItem } from "../detailRestaurant/OrderSummary";
import CartItemCard from "./CartItemCard";
import { Trash2 } from "lucide-react";

interface CartListProps {
  items: CartItem[];
  onQuantityChange: (
    itemId: CartItem["id"],
    restaurantName: string,
    change: -1 | 1,
  ) => void;
  onRemove: (itemId: CartItem["id"], restaurantName: string) => void;
  onAbandonCart: (cartId: number | undefined, restaurantName: string) => void;
}

export default function CartList({
  items,
  onQuantityChange,
  onRemove,
  onAbandonCart,
}: CartListProps) {
  const itemsByRestaurant = new Map<string, CartItem[]>();
  items.forEach((item) => {
    const restaurantItems = itemsByRestaurant.get(item.restaurantName) ?? [];
    restaurantItems.push(item);
    itemsByRestaurant.set(item.restaurantName, restaurantItems);
  });

  return (
    <section aria-label="Platos agrupados por restaurante" className="w-full">
      <div className="flex flex-col gap-8">
        {[...itemsByRestaurant].map(([restaurantName, restaurantItems], index) => (
          <section
            key={restaurantName}
            aria-labelledby={`cart-restaurant-${index}`}
            className="flex flex-col gap-4"
          >
            <h2
              id={`cart-restaurant-${index}`}
              className="m-0 text-xl font-bold text-eco-dark"
            >
              {restaurantName}
            </h2>
            <button
              type="button"
              onClick={() => onAbandonCart(restaurantItems[0]?.cartId, restaurantName)}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Abandonar este carrito
            </button>
            <div className="grid gap-4">
              {restaurantItems.map((item) => (
                <CartItemCard
                  key={`${restaurantName}-${item.id}`}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
