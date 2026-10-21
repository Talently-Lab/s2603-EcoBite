import { Outlet } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

interface MainLayoutProps {
  cartCount: number;
}

export default function MainLayout({ cartCount }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cartCount={cartCount} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}