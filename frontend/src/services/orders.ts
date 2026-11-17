const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export interface OrderConfirmationTotals {
  subtotal: number;
  deliveryCost: number;
  total: number;
}

function parseCost(value: unknown): number | null {
  const cost =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(cost) && cost >= 0 ? cost : null;
}

export async function getDeliveryCost(
  zoneId: number,
  signal?: AbortSignal,
): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/costo-envio?id_zona=${encodeURIComponent(zoneId)}`,
    { signal },
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
          : `No se pudo consultar el costo de envío (estado ${response.status}).`;
    throw new Error(message);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("costo_envio" in body)
  ) {
    throw new Error("El servidor devolvió una respuesta de costo de envío inválida.");
  }

  const cost = parseCost(body.costo_envio);
  if (cost === null) {
    throw new Error("El servidor devolvió un costo de envío inválido.");
  }
  return cost;
}
