import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { GlobalAlert } from "@/components/ui/GlobalAlert";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  cartCount: number;
  cartError?: string | null;
  cartNotice?: string | null;
  onDismissCartNotice: () => void;
}

export default function MainLayout({
  cartCount,
  cartError,
  cartNotice,
  onDismissCartNotice,
}: MainLayoutProps) {
  const { sessionExpired } = useAuth();

  useEffect(() => {
    if (!cartNotice) return;

    const timeout = window.setTimeout(onDismissCartNotice, 4000);
    return () => window.clearTimeout(timeout);
  }, [cartNotice, onDismissCartNotice]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cartCount={cartCount} />
      {sessionExpired && (
        <div className="mx-auto mt-4 w-full max-w-7xl px-5 sm:px-8">
          <GlobalAlert
            message="Tu sesión expiró. Iniciá sesión nuevamente para continuar."
            variant="info"
          />
          <Link
            to="/login"
            className="mt-2 inline-block text-sm font-semibold text-eco-dark underline underline-offset-2"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
      {cartError && (
        <div className="mx-auto mt-4 w-full max-w-7xl px-5 sm:px-8">
          <GlobalAlert message={cartError} />
        </div>
      )}
      {!cartError && cartNotice && (
        <div className="mx-auto mt-4 w-full max-w-7xl px-5 sm:px-8">
          <GlobalAlert message={cartNotice} variant="success" />
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
