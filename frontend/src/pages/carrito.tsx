import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/empty/EmptyCart";
import { HeroDescription } from "@/components/ui/HeroDescription";
import { HeroTitle } from "@/components/ui/HeroTitle";
import type { CartItem } from "@/components/detailRestaurant/OrderSummary";

interface CarritoPageProps {
  items: CartItem[];
  savedCo2Kg: number | null;
  onQuantityChange: (
    itemId: CartItem["id"],
    restaurantName: string,
    change: -1 | 1,
  ) => void;
  onRemove: (itemId: CartItem["id"], restaurantName: string) => void;
}

export function CarritoPage({
  items,
  savedCo2Kg,
  onQuantityChange,
  onRemove,
}: CarritoPageProps) {
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <EmptyCart />
      </main>
    );
  }

  const restaurantNames = [...new Set(items.map((item) => item.restaurantName))];
  const orderDescription =
    restaurantNames.length === 1
      ? `Pedido de ${restaurantNames[0]}`
      : "Pedido de varios locales";

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <HeroTitle>Mi carrito</HeroTitle>
      <HeroDescription className="mt-5">
        {orderDescription}
      </HeroDescription>
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CartList
            items={items}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        </div>
        <CartSummary items={items} savedCo2Kg={savedCo2Kg} />
      </div>
    </main>
  );
}
