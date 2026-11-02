import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../ui/Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Modal from "../modal/Modal";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { getRestaurants } from "../../services/restaurants";
import CartLink from "./CartLink";
import UserMenu from "./UserMenu";

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({ cartCount }: NavbarProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantCity, setRestaurantCity] = useState<string | null>(null);

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== "restaurante" || !user.id) {
      setRestaurantName(null);
      setRestaurantCity(null);
      return;
    }

    let isCurrent = true;
    getRestaurants()
      .then((restaurants) => {
        if (!isCurrent) return;
        const restaurant = restaurants.find((item) => item.userId === user.id);
        setRestaurantName(restaurant?.name ?? null);
        setRestaurantCity(restaurant?.city ?? null);
      })
      .catch(() => {
        if (isCurrent) {
          setRestaurantName(null);
          setRestaurantCity(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, user]);

  const emailName = user?.email?.split("@")[0];
  const userName =
    user?.rol === "restaurante"
      ? restaurantName ?? emailName ?? "tu restaurante"
      : user?.nombre ?? emailName ?? "usuario";
  const userRole = user?.rol === "restaurante" ? "Restaurante" : "Cliente";
  const userCity =
    user?.rol === "restaurante" ? restaurantCity : user?.ciudad;
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
            <CartLink count={cartCount} />
            {!loading && (isAuthenticated ? (
              <UserMenu name={userName} role={userRole} city={userCity} onLogout={handleLogout} />
            ) : (
              <>
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
              </>
            ))}
          </div>

          {/* orden mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <CartLink count={cartCount} />
            {!loading && (isAuthenticated ? (
              <UserMenu name={userName} role={userRole} city={userCity} onLogout={handleLogout} compact />
            ) : (
              <Button
                to="/registro"
                variant="dark"
                className="hover:bg-eco-dark/90"
              >
                Registrarme
              </Button>
            ))}
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
