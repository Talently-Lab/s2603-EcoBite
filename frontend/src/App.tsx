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
import MainLayout from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { useCart } from "./contexts/CartContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { DashboardPage } from "./pages/dashboard";
import { CustomerOrdersPage } from "./pages/customerOrders";
import { RestaurantSchedulesPage } from "./pages/restaurantSchedules";

function App() {
  const { items, addToCart, changeQuantity, removeFromCart, abandonCart, error, notice } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout cartCount={count} cartError={error} cartNotice={notice} />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
          </Route>
          <Route path="/restaurantes" element={<RestaurantesPage />} />
          <Route
            path="/restaurantes/:slug"
            element={
              <DetalleRestaurantePage items={items} onAdd={addToCart} />
            }
          />
          <Route
            path="/carrito"
            element={
              <CarritoPage
                items={items}
                onQuantityChange={changeQuantity}
                onRemove={removeFromCart}
                onAbandonCart={abandonCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage items={items} />}
          />
          <Route
            path="/confirmacion"
            element={<ConfirmacionPage items={items} savedCo2Kg={null} />}
          />
          <Route path="/dashboard" element={<DashboardImpactoPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/mis-pedidos" element={<CustomerOrdersPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route
              path="/admin/horarios"
              element={<RestaurantSchedulesPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
