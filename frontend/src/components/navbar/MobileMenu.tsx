// import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImpactModal: () => void;
  onOpenHowItWorksModal: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onOpenImpactModal,
  onOpenHowItWorksModal,
}: MobileMenuProps) {
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
    </nav>
  );
}
