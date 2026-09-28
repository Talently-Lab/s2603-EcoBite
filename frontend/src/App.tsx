import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/login";
import { RestaurantesPage } from "./pages/restaurantes";
import { CarritoPage } from "./pages/carrito";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/restaurantes" element={<RestaurantesPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
