import { Link } from "react-router-dom";

type NavbarProps = {
  cartCount?: number;
};

export function Navbar({ cartCount = 0 }: NavbarProps) {
  return (
    <header className="border-b border-green-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          className="text-xl font-bold text-green-800"
          to="/"
          aria-label="EcoBite, inicio"
        >
          EcoBite
        </Link>
        <nav
          aria-label="Navegacion principal"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <Link
            className="text-gray-600 transition hover:text-green-800"
            to="/login"
          >
            Acá va el login
          </Link>
          <Link
            className="text-gray-600 transition hover:text-green-800"
            to="/restaurantes"
          >
            Restaurantes
          </Link>
          <Link
            className="rounded-full bg-green-100 px-3 py-2 text-green-800"
            to="/carrito"
            aria-label={`Carrito: ${cartCount} productos`}
          >
            Carrito <span className="tabular-nums">{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
