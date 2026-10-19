import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/login";
import { RegistroPage } from "./pages/register";
import { RestaurantesPage } from "./pages/restaurants";
import { CarritoPage } from "./pages/carrito";
import { DetalleRestaurantePage } from "./pages/detailRestaurant";
import { CheckoutPage } from "./pages/checkout";
import { ConfirmacionPage } from "./pages/confirmation";
import { DashboardImpactoPage } from "./pages/dashboardImpacto";
import type { CartItem } from "./components/detailRestaurant/OrderSummary";
import type { MenuItemData } from "./services/restaurants";
import MainLayout from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";

function App() {
  const [items, setItems] = useState<CartItem[]>([]);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const handleAdd = (menuItem: MenuItemData, restaurantName: string) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === menuItem.id && item.restaurantName === restaurantName,
      );

      if (!existingItem) {
        return [
          ...currentItems,
          {
            ...menuItem,
            restaurantName,
            quantity: 1,
            unitPrice: menuItem.price,
            price: menuItem.price,
          },
        ];
      }

      return currentItems.map((item) =>
        item.id === menuItem.id && item.restaurantName === restaurantName
          ? {
              ...item,
              quantity: item.quantity + 1,
              price: (item.quantity + 1) * item.unitPrice,
            }
          : item,
      );
    });
  };
  const handleQuantityChange = (
    itemId: CartItem["id"],
    restaurantName: string,
    change: -1 | 1,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId || item.restaurantName !== restaurantName) {
          return item;
        }

        const quantity = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity,
          price: quantity * item.unitPrice,
        };
      }),
    );
  };
  const handleRemove = (
    itemId: CartItem["id"],
    restaurantName: string,
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.id !== itemId || item.restaurantName !== restaurantName,
      ),
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout cartCount={count} />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
          </Route>
          <Route path="/restaurantes" element={<RestaurantesPage />} />
          <Route
            path="/restaurantes/:slug"
            element={
              <DetalleRestaurantePage items={items} onAdd={handleAdd} />
            }
          />
          <Route
            path="/carrito"
            element={
              <CarritoPage
                items={items}
                savedCo2Kg={null}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage items={items} savedCo2Kg={null} />}
          />
          <Route
            path="/confirmacion"
            element={<ConfirmacionPage items={items} savedCo2Kg={null} />}
          />
          <Route path="/dashboard" element={<DashboardImpactoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
