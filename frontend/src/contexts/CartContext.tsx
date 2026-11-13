import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  clearNotice: () => void;
  createOrders: (data: OrderRequest) => Promise<number>;
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

function getOrderCo2Saved(order: unknown): number {
  if (
    typeof order !== "object" ||
    order === null ||
    !("co2_ahorrado" in order)
  ) {
    throw new Error(
      "El pedido se creó, pero la respuesta no incluye el ahorro de CO₂.",
    );
  }

  const value = order.co2_ahorrado;
  const co2Saved =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(co2Saved) || co2Saved < 0) {
    throw new Error(
      "El pedido se creó, pero el ahorro de CO₂ devuelto no es válido.",
    );
  }

  return co2Saved;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const GUEST_CART_STORAGE_KEY = "guestCartItems";

function readStoredCart(key: string): CartItem[] {
  try {
    const savedItems = sessionStorage.getItem(key);
    if (!savedItems) return [];
    const parsedItems: unknown = JSON.parse(savedItems);
    return Array.isArray(parsedItems) ? (parsedItems as CartItem[]) : [];
  } catch {
    return [];
  }
}

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
    return readStoredCart(USE_API_CART ? GUEST_CART_STORAGE_KEY : "cartItems");
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const cartSyncRef = useRef<{ token: string; promise: Promise<CartItem[]> } | null>(null);

  useEffect(() => {
    if (!USE_API_CART || authLoading) return;

    if (!token || !isAuthenticated || user?.rol !== "cliente") {
      // Restore guest data when leaving an authenticated customer session.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(readStoredCart(GUEST_CART_STORAGE_KEY));
      setError(null);
      setNotice(null);
      return;
    }

    let isCurrent = true;
    let syncPromise = cartSyncRef.current?.token === token
      ? cartSyncRef.current.promise
      : null;

    if (!syncPromise) {
      syncPromise = (async () => {
        let guestItems = readStoredCart(GUEST_CART_STORAGE_KEY);
        for (const guestItem of guestItems) {
          if (
            !Number.isInteger(Number(guestItem.restaurantId)) ||
            Number(guestItem.restaurantId) <= 0 ||
            !Number.isInteger(Number(guestItem.id)) ||
            Number(guestItem.id) <= 0 ||
            !Number.isInteger(guestItem.quantity) ||
            guestItem.quantity <= 0
          ) {
            throw new Error("No se pudo sincronizar un producto del carrito guardado.");
          }
          await addCartProduct(
            token,
            String(guestItem.restaurantId),
            guestItem.id,
            guestItem.quantity,
          );
          guestItems = guestItems.filter((item) => item !== guestItem);
          try {
            sessionStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestItems));
          } catch {
            // The server cart remains available even when guest-cart storage is unavailable.
          }
        }
        return getActiveCartItems(token);
      })();
      cartSyncRef.current = { token, promise: syncPromise };
    }

    syncPromise
      .then((serverItems) => {
        if (isCurrent) {
          setItems(serverItems);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(loadError instanceof Error
            ? `No se pudo sincronizar el carrito: ${loadError.message}`
            : "No se pudo sincronizar el carrito.");
        }
      })
      .finally(() => {
        if (cartSyncRef.current?.promise === syncPromise) {
          cartSyncRef.current = null;
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [authLoading, token, user?.rol, isAuthenticated]);

  useEffect(() => {
    try {
      if (USE_API_CART) {
        if (!authLoading && (!isAuthenticated || user?.rol !== "cliente")) {
          sessionStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
        }
      } else {
        sessionStorage.setItem("cartItems", JSON.stringify(items));
      }
    } catch {
      // El carrito sigue funcionando en memoria si el almacenamiento no está disponible.
    }
  }, [items, authLoading, isAuthenticated, user?.rol]);

  const addToCart = useCallback(async (item: MenuItemData, restaurantId: string, restaurantName: string) => {
    setNotice(null);
    if (USE_API_CART && isAuthenticated) {
      if (!token || user?.rol !== "cliente") {
        setError("Solo los clientes pueden agregar productos al carrito.");
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

  const clearNotice = useCallback(() => setNotice(null), []);

  const createOrders = useCallback(async (data: OrderRequest) => {
    if (!token) throw new Error("Iniciá sesión para confirmar tu pedido.");
    const cartIds = [...new Set(items.map((item) => item.cartId).filter((id): id is number => id !== undefined))];
    if (cartIds.length === 0 || cartIds.length !== new Set(items.map((item) => item.cartId)).size) {
      throw new Error("No se pudo identificar uno de los carritos del pedido.");
    }

    let totalCo2Saved = 0;
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
      totalCo2Saved += getOrderCo2Saved(result.pedido);
      setItems((current) => current.filter((item) => item.cartId !== cartId));
    }
    setNotice(null);
    setError(null);
    return totalCo2Saved;
  }, [items, token]);

  const canViewCart =
    !USE_API_CART ||
    (!authLoading && (!isAuthenticated || user?.rol === "cliente"));
  const value = useMemo(() => ({
    items: canViewCart ? items : [],
    error: canViewCart ? error : null,
    notice: canViewCart ? notice : null,
    addToCart,
    changeQuantity,
    removeFromCart,
    abandonCart,
    clearCart,
    clearNotice,
    createOrders,
  }), [items, error, notice, canViewCart, addToCart, changeQuantity, removeFromCart, abandonCart, clearCart, clearNotice, createOrders]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}
