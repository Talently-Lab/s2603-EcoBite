import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Modal from "../modal/Modal";
import Button from "../ui/Button";
import { ShoppingCart } from "lucide-react";

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({ cartCount }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const cartLink = (
    <Link
      to="/carrito"
      aria-label={`Ver carrito, ${cartCount} ${cartCount === 1 ? "ítem" : "ítems"}`}
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-eco-dark transition-colors hover:bg-eco-light/30"
    >
      <ShoppingCart aria-hidden="true" className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-eco-dark px-1 text-xs font-bold text-white">
          {cartCount}
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header className="relative border-b border-eco-sage bg-white">
        <div className="flex h-19 w-full flex-nowrap items-center justify-between gap-x-1 px-3 font-bold sm:px-4 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-3 lg:gap-3 xl:ml-4 xl:gap-4 2xl:ml-6 2xl:gap-6 pl-6">
            <Link to="/" aria-label="EcoBite, inicio">
              <Logo className="text-2xl font-bold" />
            </Link>

            <NavLinks
              onOpenImpactModal={() => setIsImpactOpen(true)}
              onOpenHowItWorksModal={() => setIsHowItWorksOpen(true)}
            />
          </div>

          <div className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-sm md:flex md:gap-2 lg:gap-4 xl:gap-5">
            <Button
              to="/login"
              variant="light"
              className="px-2 py-1.5 text-xs hover:bg-gray-50 lg:px-3.5 lg:py-2 lg:text-sm"
            >
              Iniciar sesión
            </Button>
            <Button
              to="/registro"
              variant="dark"
              className="px-2 py-1.5 text-xs hover:bg-eco-dark/90 lg:px-3.5 lg:py-2 lg:text-sm"
            >
              Registrarme
            </Button>
            {cartLink}
          </div>

          {/* orden mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              to="/registro"
              variant="dark"
              className="hover:bg-eco-dark/90"
            >
              Registrarme
            </Button>
            {cartLink}
            <button
              type="button"
              className="text-2xl md:hidden"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onOpenImpactModal={() => {
              setIsMobileMenuOpen(false);
              setIsImpactOpen(true);
            }}
            onOpenHowItWorksModal={() => {
              setIsMobileMenuOpen(false);
              setIsHowItWorksOpen(true);
            }}
          />
        </div>
      </header>

      <Modal
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
        title="Impacto"
      >
        <p>Próximamente.</p>
      </Modal>

      <Modal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        title="Cómo funciona"
      >
        <p>Próximamente.</p>
      </Modal>
    </>
  );
}
