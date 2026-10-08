import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Modal from "../modal/Modal";
import Button from "../ui/Button";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <>
      <header className="relative border-b border-eco-sage bg-white">
        <div className="mx-auto flex h-19 flex-nowrap items-center justify-between gap-x-1 px-3 font-bold sm:px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 md:gap-3 lg:gap-3 xl:ml-8 xl:gap-8 2xl:ml-15 2xl:gap-20">
            <Link to="/" aria-label="EcoBite, inicio">
              <Logo className="text-2xl font-bold" />
            </Link>

            <NavLinks
              onOpenImpactModal={() => setIsImpactOpen(true)}
              onOpenHowItWorksModal={() => setIsHowItWorksOpen(true)}
            />
          </div>

          <div className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-sm md:flex lg:gap-5 lg:mr-2 xl:gap-6 -mr-2.5 lg:mr-0">
            <Button
            to="/login" variant="light">Iniciar sesión</Button>
            <Button to="/registro" variant="dark">
              Registrarme
            </Button>
          </div>

          {/* orden mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Button to="/registro" variant="dark">
              Registrarme
            </Button>
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
