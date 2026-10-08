import { Link } from "react-router-dom";
import Button from "../ui/Button";

interface NavLinksProps {
  mobile?: boolean;
  onLinkClick?: () => void;
  onOpenImpactModal: () => void;
  onOpenHowItWorksModal: () => void;
}

export default function NavLinks({
  mobile = false,
  onLinkClick,
  onOpenImpactModal,
  onOpenHowItWorksModal,
}: NavLinksProps) {
  
  // Estilo único para las filas del menú móvil
  const itemStyle = mobile 
    ? "flex items-center justify-between w-full py-4 border-b border-gray-200 font-bold text-eco-dark text-base text-left" 
    : "";

  return (
    <nav
      className={
        mobile
          ? "flex flex-col w-full bg-eco-light/20 px-6 py-4"
          : "hidden shrink-0 items-center gap-2 whitespace-nowrap text-sm md:flex lg:gap-2 xl:gap-4 2xl:gap-5"
      }
    >
      <Link to="/restaurantes" onClick={onLinkClick} className={itemStyle}>
        <span>Explorar</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </Link>

      <button type="button" onClick={() => { onOpenHowItWorksModal(); mobile && onLinkClick?.(); }} className={itemStyle}>
        <span>Cómo funciona</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </button>

      <button type="button" onClick={() => { onOpenImpactModal(); mobile && onLinkClick?.(); }} className={itemStyle}>
        <span>Impacto</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </button>

      <Link to="/restaurantes" onClick={onLinkClick} className={itemStyle}>
        <span>Portal Restaurante</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </Link>

      {mobile && (
        <Button to="/login" variant="light" className="inline-flex w-full justify-center mt-6" onClick={onLinkClick}>
          Iniciar sesión
        </Button>
      )}
    </nav>
  );
}