import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/login";
import { RestaurantesPage } from "./pages/restaurantes";
import { CarritoPage } from "./pages/carrito";
import { DetalleLocalPage } from "./pages/detalleLocal";
import { CheckoutPage } from "./pages/checkout";
import { ConfirmacionPage } from "./pages/confirmacion";
import { DashboardImpactoPage } from "./pages/dashboardImpacto";
import { RegistroPage } from "./pages/registro";
import { Navbar } from "./components/navbar/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/restaurantes" element={<RestaurantesPage />} />
        <Route path="/detalle/:id" element={<DetalleLocalPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmacion" element={<ConfirmacionPage />} />
        <Route path="/dashboard" element={<DashboardImpactoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
