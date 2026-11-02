import { Outlet } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { GlobalAlert } from "@/components/ui/GlobalAlert";

interface MainLayoutProps {
  cartCount: number;
  cartError?: string | null;
  cartNotice?: string | null;
}

export default function MainLayout({ cartCount, cartError, cartNotice }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cartCount={cartCount} />
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
