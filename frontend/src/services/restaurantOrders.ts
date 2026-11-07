const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export type RestaurantOrderAction = "aceptar" | "despachar" | "rechazar";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(
  body: unknown,
  status: number,
  fallback = `La solicitud de pedidos falló (estado ${status}).`,
): string {
  if (isRecord(body)) {
    if (typeof body.mensaje === "string") return body.mensaje;
    if (typeof body.error === "string") return body.error;
  }
  return fallback;
}

export async function updateRestaurantOrderStatus(
  token: string,
  orderId: number,
  action: RestaurantOrderAction,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/${action}`,
    {
      method: "PATCH",
      headers: { Authorization: ["Bearer", token].join(" ") },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        body,
        response.status,
        `No se pudo actualizar el pedido (estado ${response.status}).`,
      ),
    );
  }
}
