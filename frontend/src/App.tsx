import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/login";
import { RestaurantesPage } from "./pages/restaurants";
import { CarritoPage } from "./pages/carrito";
import { DetalleRestaurantePage } from "./pages/detailRestaurant";
import { CheckoutPage } from "./pages/checkout";
import { ConfirmacionPage } from "./pages/confirmation";
import { DashboardImpactoPage } from "./pages/dashboardImpacto";
import { RegistroPage } from "./pages/register";
import type { CartItem } from "./components/detailRestaurant/OrderSummary";
import type { MenuItemData } from "./services/restaurants";
import MainLayout from "./layouts/MainLayout";

function App() {
  const [items, setItems] = useState<CartItem[]>([]);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const handleAdd = (menuItem: MenuItemData) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === menuItem.id);

      if (!existingItem) {
        return [
          ...currentItems,
          { ...menuItem, quantity: 1, price: menuItem.price },
        ];
      }

      return currentItems.map((item) =>
        item.id === menuItem.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              price: item.price + menuItem.price,
            }
          : item,
      );
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/restaurantes" element={<RestaurantesPage />} />
          <Route
            path="/restaurantes/:slug"
            element={
              <DetalleRestaurantePage items={items} onAdd={handleAdd} />
            }
          />
          <Route path="/carrito" element={<CarritoPage count={count} />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmacion" element={<ConfirmacionPage />} />
          <Route path="/dashboard" element={<DashboardImpactoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
