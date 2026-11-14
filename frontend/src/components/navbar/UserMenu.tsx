import { useRef } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserDashboardPath,
  getUserOrdersPath,
} from "../../utils/userRoutes";

interface UserMenuProps {
  name: string;
  role: string;
  city?: string | null;
  isClient?: boolean;
  onLogout: () => void;
  compact?: boolean;
  dashboard?: boolean;
}

export default function UserMenu({
  name,
  role,
  city,
  isClient = false,
  onLogout,
  compact = false,
  dashboard = false,
}: UserMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const { user } = useAuth();
  const dashboardPath = user ? getUserDashboardPath(user) : "/";

  return (
    <details ref={menuRef} className="group relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-sm font-semibold text-eco-dark transition-colors hover:bg-eco-light/30 [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco-light/40">
          <UserRound aria-hidden="true" className="h-5 w-5" />
        </span>
        {!compact && (
          <span className="flex max-w-40 flex-col items-start leading-tight">
            <span className="max-w-full truncate">{name}</span>
            <span className="max-w-full truncate text-xs font-normal text-gray-500">
              {role}{city?.trim() ? ` · ${city.trim()}` : ""}
            </span>
          </span>
        )}
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 min-w-52 rounded-lg border border-eco-sage bg-white p-2 shadow-lg">
        <p className="truncate px-3 py-2 text-sm font-semibold text-eco-dark">
          Hola, {name}
        </p>
        {isClient && (
          <Link
            to={user ? getUserOrdersPath(user) : "/"}
            onClick={() => {
              if (menuRef.current) menuRef.current.open = false;
            }}
            className="block rounded-md px-3 py-2 text-sm font-semibold text-eco-dark transition-colors hover:bg-eco-light/30"
          >
            Mis pedidos
          </Link>
        )}
        {dashboard && compact && (
          <>
            <hr className="my-1 border-eco-sage" />
            <NavLinks
              dashboard
              mobile
              onLinkClick={() => {
                if (menuRef.current) menuRef.current.open = false;
              }}
            />
            <hr className="my-1 border-eco-sage" />
          </>
        )}
        <Link
          to={dashboard ? "/" : dashboardPath}
          className="block rounded-md px-3 py-2 text-sm font-semibold text-eco-dark transition-colors hover:bg-eco-light/30"
        >
          {dashboard ? "Salir del dashboard" : "Mi dashboard"}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-semibold text-eco-dark transition-colors hover:bg-eco-light/30"
        >
          Cerrar sesión
        </button>
      </div>
    </details>
  );
}
