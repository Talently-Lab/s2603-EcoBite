import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface CartLinkProps {
  count: number;
}

export default function CartLink({ count }: CartLinkProps) {
  return (
    <Link
      to="/carrito"
      aria-label={`Ver carrito, ${count} ${count === 1 ? "ítem" : "ítems"}`}
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-eco-dark transition-colors hover:bg-eco-light/30"
    >
      <ShoppingCart aria-hidden="true" className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-eco-dark px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
