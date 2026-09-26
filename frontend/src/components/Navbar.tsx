type NavbarProps = {
  cartCount?: number;
};

export function Navbar({ cartCount = 0 }: NavbarProps) {
  return (
    <header className="border-b border-[#dce5d8] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a
          className="text-xl font-bold text-[#245b36]"
          href="/"
          aria-label="EcoBite, inicio"
        >
          EcoBite
        </a>
        <nav
          aria-label="Navegacion principal"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <a
            className="text-[#526357] transition hover:text-[#245b36]"
            href="#restaurants"
          >
            Restaurantes
          </a>
          <span
            className="rounded-full bg-[#edf5e9] px-3 py-2 text-[#245b36]"
            aria-label={`Carrito: ${cartCount} productos`}
          >
            Carrito <span className="tabular-nums">{cartCount}</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
