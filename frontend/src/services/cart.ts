import type { CartItem } from "../components/detailRestaurant/OrderSummary";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

interface ApiCart {
  id: number;
  id_restaurante: number;
  estado: "pendiente" | "convertido" | "abandonado";
  nombre_restaurante?: string;
}

interface ApiCartProduct {
  id_producto: number;
  cantidad: number;
  nombre_producto: string;
  precio: number | string;
  imagen: string | null;
  id_restaurante: number;
}

interface ApiCartDetailResponse {
  carrito: ApiCart;
  productos: ApiCartProduct[];
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const result = await response.json().catch(() => ({})) as T & { mensaje?: string; error?: string };
  if (!response.ok) {
    throw new Error(result.mensaje ?? result.error ?? "No se pudo actualizar el carrito.");
  }
  return result;
}

export async function getActiveCartItems(token: string): Promise<CartItem[]> {
  const { carritos } = await request<{ carritos: ApiCart[] }>("/carritos", token);
  const activeCarts = carritos.filter((cart) => cart.estado === "pendiente");
  const details = await Promise.all(
    activeCarts.map((cart) =>
      request<ApiCartDetailResponse>(`/carritos/${cart.id}`, token),
    ),
  );

  return details.flatMap(({ carrito, productos }) => productos.map((product) => {
    const unitPrice = Number(product.precio);
    return {
      id: product.id_producto,
      name: product.nombre_producto,
      imageUrl: product.imagen ?? undefined,
      restaurantName: carrito.nombre_restaurante ?? `Restaurante ${carrito.id_restaurante}`,
      quantity: product.cantidad,
      unitPrice,
      price: unitPrice * product.cantidad,
      restaurantId: product.id_restaurante,
      cartId: carrito.id,
    };
  }));
}

export function addCartProduct(
  token: string,
  restaurantId: string,
  productId: string | number,
  quantity = 1,
) {
  return request(`/carritos/${encodeURIComponent(restaurantId)}/productos`, token, {
    method: "POST",
    body: JSON.stringify({ productoId: Number(productId), cantidad: quantity }),
  });
}

export function updateCartProductQuantity(
  token: string,
  cartId: number,
  productId: string | number,
  quantity: number,
) {
  return request(`/carritos/${cartId}/productos/${encodeURIComponent(productId)}`, token, {
    method: "PATCH",
    body: JSON.stringify({ cantidad: quantity }),
  });
}

export function removeCartProduct(token: string, cartId: number, productId: string | number) {
  return request(`/carritos/${cartId}/productos/${encodeURIComponent(productId)}`, token, {
    method: "DELETE",
  });
}

export function abandonCart(token: string, cartId: number) {
  return request(`/carritos/${cartId}`, token, { method: "DELETE" });
}
