import { Link } from "react-router-dom";

interface AccountTabsProps {
  activeTab: "login" | "register";
}

export function AccountTabs({ activeTab }: AccountTabsProps) {
  return (
    <nav
      aria-label="Acceso a tu cuenta"
      className="relative mb-6 flex border-b border-gray-200"
    >
      <Link
        to="/login"
        aria-current={activeTab === "login" ? "page" : undefined}
        className={`w-1/2 px-3 py-3 text-center text-sm transition-colors ${
          activeTab === "login"
            ? "font-bold text-eco-dark"
            : "font-semibold text-gray-500 hover:text-eco-dark"
        }`}
      >
        Iniciar sesión
      </Link>
      <Link
        to="/registro"
        aria-current={activeTab === "register" ? "page" : undefined}
        className={`w-1/2 px-3 py-3 text-center text-sm transition-colors ${
          activeTab === "register"
            ? "font-bold text-eco-dark"
            : "font-semibold text-gray-500 hover:text-eco-dark"
        }`}
      >
        Registrarme
      </Link>
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-0.5 w-1/2 bg-eco-dark transition-transform duration-300 ease-in-out ${
          activeTab === "register" ? "translate-x-full" : ""
        }`}
      />
    </nav>
  );
}
