import { Link, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { getUserDashboardPath, getUserSchedulesPath } from "../../utils/userRoutes";

interface NavLinksProps {
  mobile?: boolean;
  dashboard?: boolean;
  onLinkClick?: () => void;
  onOpenImpactModal?: () => void;
  onOpenHowItWorksModal?: () => void;
}

export default function NavLinks({
  mobile = false,
  dashboard = false,
  onLinkClick,
  onOpenImpactModal,
  onOpenHowItWorksModal,
}: NavLinksProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const { pathname, search } = useLocation();

  if (dashboard) {
    const activeTab = new URLSearchParams(search).get("tab");
    const dashboardPath = user ? getUserDashboardPath(user) : "/dashboard";
    const schedulesPath = user ? getUserSchedulesPath(user) : "/horarios";
    const isSchedulesPage = pathname === schedulesPath;
    const dashboardItemStyle =
      mobile
        ? "w-full rounded-md px-3 py-2 text-left text-sm font-semibold"
        : "relative flex h-full shrink-0 items-center justify-center px-0.5 pt-0.5 text-xs font-semibold sm:text-sm";
    const activeDashboardItemClass = mobile
      ? `${dashboardItemStyle} bg-eco-light/30 text-eco-dark`
      : `${dashboardItemStyle} text-eco-dark after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:rounded-full after:bg-eco-dark`;
    const inactiveDashboardItemClass = `${dashboardItemStyle} text-gray-600`;

    return (
      <nav
        aria-label="Navegación del panel"
        className={
          mobile
            ? "flex w-full flex-col gap-1"
            : "hidden h-full min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap md:flex sm:gap-5"
        }
      >
        <Link
          to={dashboardPath}
          onClick={onLinkClick}
          aria-current={!isSchedulesPage && !activeTab ? "page" : undefined}
          className={
            !isSchedulesPage && !activeTab
              ? activeDashboardItemClass
              : inactiveDashboardItemClass
          }
        >
          Resumen
        </Link>
        <Link
          to={`${dashboardPath}?tab=orders`}
          onClick={onLinkClick}
          aria-current={!isSchedulesPage && activeTab === "orders" ? "page" : undefined}
          className={
            !isSchedulesPage && activeTab === "orders"
              ? activeDashboardItemClass
              : inactiveDashboardItemClass
          }
        >
          Pedidos
        </Link>
        <Link
          to={`${dashboardPath}?tab=products`}
          onClick={onLinkClick}
          aria-current={!isSchedulesPage && activeTab === "products" ? "page" : undefined}
          className={
            !isSchedulesPage && activeTab === "products"
              ? activeDashboardItemClass
              : inactiveDashboardItemClass
          }
        >
          Productos
        </Link>
        <Link
          to={schedulesPath}
          onClick={onLinkClick}
          aria-current={isSchedulesPage ? "page" : undefined}
          className={
            isSchedulesPage
              ? activeDashboardItemClass
              : inactiveDashboardItemClass
          }
        >
          Horarios
        </Link>
      </nav>
    );
  }
  
  // Estilo único para las filas del menú móvil
  const itemStyle = mobile 
    ? "flex items-center justify-between w-full py-4 border-b border-gray-200 font-bold text-eco-dark text-base text-left" 
    : "rounded-md transition-shadow duration-200 hover:shadow-md";

  return (
    <nav
      className={
        mobile
          ? "flex flex-col w-full bg-eco-light/20 px-6 py-4"
          : "hidden shrink-0 items-center gap-2 whitespace-nowrap text-xs md:flex md:gap-1 lg:text-sm lg:gap-2 xl:gap-4 2xl:gap-5"
      }
    >
      <Link to="/restaurantes" onClick={onLinkClick} className={itemStyle}>
        <span>Explorar</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </Link>

      <button type="button" onClick={() => { onOpenHowItWorksModal?.(); if (mobile) onLinkClick?.(); }} className={itemStyle}>
        <span>Cómo funciona</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </button>

      <button type="button" onClick={() => { onOpenImpactModal?.(); if (mobile) onLinkClick?.(); }} className={itemStyle}>
        <span>Impacto</span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </button>

      <Link to="/restaurantes" onClick={onLinkClick} className={itemStyle}>
        <span
          className={
            mobile
              ? ""
              : "flex flex-col text-center leading-tight md:flex-row md:gap-1"
          }
        >
          <span>Portal</span>
          <span>Restaurante</span>
        </span>
        {mobile && <span className="text-eco-dark font-normal">&gt;</span>}
      </Link>

      {mobile && !loading && !isAuthenticated && (
        <Button
          to="/login"
          variant="light"
          className="mt-6 inline-flex w-full justify-center hover:bg-gray-50"
          onClick={onLinkClick}
        >
          Iniciar sesión
        </Button>
      )}
    </nav>
  );
}
