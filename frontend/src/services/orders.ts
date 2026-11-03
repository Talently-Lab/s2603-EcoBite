const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export type RestaurantOrderAction = "aceptar" | "despachar" | "rechazar";

export async function updateRestaurantOrderStatus(
  token: string,
  orderId: number,
  action: RestaurantOrderAction,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/${action}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "mensaje" in body &&
      typeof body.mensaje === "string"
        ? body.mensaje
        : typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof body.error === "string"
          ? body.error
          : `No se pudo actualizar el pedido (estado ${response.status}).`;
    throw new Error(message);
  }
}
