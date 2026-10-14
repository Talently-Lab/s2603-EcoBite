import { Outlet } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

interface MainLayoutProps {
  cartCount: number;
}

export default function MainLayout({ cartCount }: MainLayoutProps) {
  return (
    <>
      <Navbar cartCount={cartCount} />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}