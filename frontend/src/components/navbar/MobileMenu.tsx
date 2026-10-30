// import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenImpactModal: () => void;
  onOpenHowItWorksModal: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onLogout,
  onOpenImpactModal,
  onOpenHowItWorksModal,
}: MobileMenuProps) {
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav
      className={`absolute left-0 top-full z-50 w-full border-t border-eco-sage bg-white shadow-md transition-all duration-300 ease-in-out md:hidden ${
        isOpen
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <NavLinks
        mobile
        onLinkClick={onClose}
        onOpenImpactModal={onOpenImpactModal}
        onOpenHowItWorksModal={onOpenHowItWorksModal}
      />
      {!loading && isAuthenticated && (
        <Button
          type="button"
          variant="dark"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="mx-6 mb-5 mt-3 w-[calc(100%-3rem)] justify-center"
        >
          Cerrar sesión
        </Button>
      )}
    </nav>
  );
}
