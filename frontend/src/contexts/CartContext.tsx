import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "../components/detailRestaurant/OrderSummary";
import type { MenuItemData } from "../services/restaurants";
import {
  abandonCart as abandonCartRequest,
  addCartProduct,
  getActiveCartItems,
  removeCartProduct,
  updateCartProductQuantity,
} from "../services/cart";
import { useAuth } from "./AuthContext";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");
const USE_API_CART = import.meta.env.VITE_DATA_SOURCE === "api";

interface CartContextValue {
  items: CartItem[];
  error: string | null;
  notice: string | null;
  addToCart: (item: MenuItemData, restaurantId: string, restaurantName: string) => void | Promise<void>;
  changeQuantity: (itemId: CartItem["id"], restaurantName: string, change: -1 | 1) => void | Promise<void>;
  removeFromCart: (itemId: CartItem["id"], restaurantName: string) => void | Promise<void>;
  abandonCart: (cartId: number | undefined, restaurantName: string) => void | Promise<void>;
  clearCart: () => void | Promise<void>;
  createOrders: (data: OrderRequest) => Promise<unknown[]>;
}

interface OrderRequest {
  id_zona: number;
  tipo_pago: "efectivo" | "tarjeta";
  direccion_entrega: string;
  piso_entrega?: string;
  departamento_entrega?: string;
  indicacion_entrega?: string;
}

interface ApiOrderResponse {
  pedido: unknown;
  mensaje?: string;
  error?: string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

async function createOrder(body: Record<string, unknown>, token: string): Promise<ApiOrderResponse> {
  const response = await fetch(`${API_BASE_URL}/ordenes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({})) as ApiOrderResponse;
  if (!response.ok) {
    throw new Error(result.mensaje ?? result.error ?? "No se pudo crear el pedido.");
  }
  return result;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = sessionStorage.getItem("cartItems");
      if (!savedItems) return [];
      const parsedItems: unknown = JSON.parse(savedItems);
      return Array.isArray(parsedItems) ? (parsedItems as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (
      !USE_API_CART ||
      authLoading ||
      !token ||
      !isAuthenticated ||
      user?.rol !== "cliente"
    ) return;

    let isCurrent = true;
    getActiveCartItems(token)
      .then((serverItems) => {
        if (isCurrent) {
          setItems(serverItems);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el carrito.");
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [authLoading, token, user?.rol, isAuthenticated]);

  useEffect(() => {
    try {
      sessionStorage.setItem("cartItems", JSON.stringify(items));
    } catch {
      // El carrito sigue funcionando en memoria si el almacenamiento no está disponible.
    }
  }, [items]);

  const addToCart = useCallback(async (item: MenuItemData, restaurantId: string, restaurantName: string) => {
    setNotice(null);
    if (USE_API_CART) {
      if (!token || !isAuthenticated || user?.rol !== "cliente") {
        setError("Iniciá sesión como cliente para guardar productos en tu carrito.");
        return;
      }
      try {
        await addCartProduct(token, restaurantId, item.id);
        setItems(await getActiveCartItems(token));
        setError(null);
        setNotice(`Se agregó ${item.name} al carrito de ${restaurantName}.`);
      } catch (addError: unknown) {
        setError(addError instanceof Error ? addError.message : "No se pudo agregar el producto.");
      }
      return;
    }

    const idRestaurante = Number(restaurantId);
    if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
      setError("No se pudo identificar el restaurante.");
      return;
    }
    setItems((current) => {
      const existing = current.find((entry) => Number(entry.id) === Number(item.id) && entry.restaurantId === idRestaurante);
      if (existing) {
        return current.map((entry) => entry === existing
          ? { ...entry, quantity: entry.quantity + 1, price: (entry.quantity + 1) * entry.unitPrice }
          : entry);
      }
      return [...current, {
        ...item,
        id: Number(item.id),
        restaurantName,
        restaurantId: idRestaurante,
        quantity: 1,
        unitPrice: item.price,
        price: item.price,
      }];
    });
    setError(null);
    setNotice(`Se agregó ${item.name} al carrito de ${restaurantName}.`);
  }, [isAuthenticated, token, user?.rol]);

  const changeQuantity = useCallback(async (itemId: CartItem["id"], restaurantName: string, change: -1 | 1) => {
    const targetItem = items.find((item) => item.id === itemId && item.restaurantName === restaurantName);
    setNotice(null);
    if (USE_API_CART && token && targetItem?.cartId) {
      try {
        await updateCartProductQuantity(token, targetItem.cartId, itemId, Math.max(1, targetItem.quantity + change));
        setItems(await getActiveCartItems(token));
        setError(null);
        setNotice(`Cantidad de ${targetItem.name} actualizada.`);
      } catch (updateError: unknown) {
        setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar la cantidad.");
      }
      return;
    }
    setItems((current) => current.map((item) => {
      if (item.id !== itemId || item.restaurantName !== restaurantName) return item;
      const quantity = Math.max(1, item.quantity + change);
      return { ...item, quantity, price: quantity * item.unitPrice };
    }));
    setError(null);
    if (targetItem) setNotice(`Cantidad de ${targetItem.name} actualizada.`);
  }, [items, token]);

  const removeFromCart = useCallback(async (itemId: CartItem["id"], restaurantName: string) => {
    const targetItem = items.find((item) => item.id === itemId && item.restaurantName === restaurantName);
    setNotice(null);
    if (USE_API_CART && token && targetItem?.cartId) {
      try {
        await removeCartProduct(token, targetItem.cartId, itemId);
        setItems(await getActiveCartItems(token));
        setError(null);
        setNotice(`Se eliminó ${targetItem.name} del carrito.`);
      } catch (removeError: unknown) {
        setError(removeError instanceof Error ? removeError.message : "No se pudo eliminar el producto.");
      }
      return;
    }
    setItems((current) => current.filter((item) => item.id !== itemId || item.restaurantName !== restaurantName));
    setError(null);
    if (targetItem) setNotice(`Se eliminó ${targetItem.name} del carrito.`);
  }, [items, token]);

  const abandonCart = useCallback(async (cartId: number | undefined, restaurantName: string) => {
    setNotice(null);
    if (USE_API_CART && token && cartId) {
      try {
        await abandonCartRequest(token, cartId);
        setItems(await getActiveCartItems(token));
        setError(null);
        setNotice(`Se abandonó el carrito de ${restaurantName}.`);
      } catch (abandonError: unknown) {
        setError(abandonError instanceof Error ? abandonError.message : "No se pudo abandonar el carrito.");
      }
      return;
    }
    setItems((current) => current.filter((item) => item.restaurantName !== restaurantName));
    setError(null);
    setNotice(`Se abandonó el carrito de ${restaurantName}.`);
  }, [token]);

  const clearCart = useCallback(async () => {
    setNotice(null);
    if (USE_API_CART && token) {
      const cartIds = [...new Set(items.map((item) => item.cartId).filter((id): id is number => id !== undefined))];
      try {
        await Promise.all(cartIds.map((cartId) => abandonCartRequest(token, cartId)));
        setItems(await getActiveCartItems(token));
        setError(null);
        setNotice("Se vaciaron tus carritos.");
      } catch (clearError: unknown) {
        setError(clearError instanceof Error ? clearError.message : "No se pudo vaciar el carrito.");
      }
      return;
    }
    setItems([]);
    setError(null);
    setNotice("Se vaciaron tus carritos.");
  }, [items, token]);

  const createOrders = useCallback(async (data: OrderRequest) => {
    if (!token) throw new Error("Iniciá sesión para confirmar tu pedido.");
    const cartIds = [...new Set(items.map((item) => item.cartId).filter((id): id is number => id !== undefined))];
    if (cartIds.length === 0 || cartIds.length !== new Set(items.map((item) => item.cartId)).size) {
      throw new Error("No se pudo identificar uno de los carritos del pedido.");
    }

    const orders: unknown[] = [];
    for (const cartId of cartIds) {
      const restaurantItems = items.filter((item) => item.cartId === cartId);
      const restaurantId = restaurantItems[0]?.restaurantId;
      const result = await createOrder({
        ...data,
        id_carrito: cartId,
        id_restaurante: restaurantId,
        productos: restaurantItems.map((item) => ({
          id_producto: Number(item.id),
          cantidad: item.quantity,
        })),
      }, token);
      orders.push(result.pedido);
      setItems((current) => current.filter((item) => item.cartId !== cartId));
    }
    setNotice(null);
    setError(null);
    return orders;
  }, [items, token]);

  const canViewCart =
    !USE_API_CART ||
    (!authLoading && isAuthenticated && user?.rol === "cliente");
  const value = useMemo(() => ({
    items: canViewCart ? items : [],
    error: canViewCart ? error : null,
    notice: canViewCart ? notice : null,
    addToCart,
    changeQuantity,
    removeFromCart,
    abandonCart,
    clearCart,
    createOrders,
  }), [items, error, notice, canViewCart, addToCart, changeQuantity, removeFromCart, abandonCart, clearCart, createOrders]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}
