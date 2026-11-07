const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export interface CustomerOrder {
  id: number;
  restaurant: string;
  status: string;
  paymentMethod: string;
  total: number;
  co2Saved: number | null;
  createdAt: string;
}

export interface CustomerOrderDetailItem {
  id: number;
  product: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrderDetails {
  id: number;
  restaurant: string;
  total: number;
  paymentMethod: string;
  deliveryCost: number;
  co2Saved: number | null;
  items: CustomerOrderDetailItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(body: unknown, status: number): string {
  if (isRecord(body)) {
    if (typeof body.mensaje === "string") return body.mensaje;
    if (typeof body.error === "string") return body.error;
  }
  return `La solicitud de pedidos falló (estado ${status}).`;
}

function parseNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCustomerOrder(value: unknown): CustomerOrder {
  if (!isRecord(value)) {
    throw new Error("La respuesta de pedidos tiene un formato inesperado.");
  }

  const id = parseNumber(value.id);
  const total = parseNumber(value.total);
  const co2Saved =
    value.co2_ahorrado === null ? null : parseNumber(value.co2_ahorrado);

  if (
    id === null ||
    !Number.isInteger(id) ||
    typeof value.restaurante !== "string" ||
    typeof value.estado !== "string" ||
    typeof value.forma_pago !== "string" ||
    total === null ||
    (co2Saved === null && value.co2_ahorrado !== null) ||
    typeof value.fecha_creacion !== "string"
  ) {
    throw new Error("La respuesta de pedidos tiene un formato inesperado.");
  }

  return {
    id,
    restaurant: value.restaurante,
    status: value.estado,
    paymentMethod: value.forma_pago,
    total,
    co2Saved,
    createdAt: value.fecha_creacion,
  };
}

export async function listCustomerOrders(
  token: string,
): Promise<CustomerOrder[]> {
  const response = await fetch(`${API_BASE_URL}/ordenes/mis-pedidos`, {
    headers: { Authorization: ["Bearer", token].join(" ") },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!Array.isArray(body)) {
    throw new Error("La respuesta de pedidos tiene un formato inesperado.");
  }
  return body.map(parseCustomerOrder);
}

export async function getCustomerOrderDetails(
  token: string,
  orderId: number,
  signal?: AbortSignal,
): Promise<CustomerOrderDetails> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/detalle`,
    {
      headers: { Authorization: ["Bearer", token].join(" ") },
      signal,
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!isRecord(body) || !Array.isArray(body.detalles)) {
    throw new Error("La respuesta del detalle del pedido tiene un formato inesperado.");
  }

  const id = parseNumber(body.id);
  const total = parseNumber(body.total);
  const deliveryCost = parseNumber(body.costo_envio);
  const co2Saved =
    body.co2_ahorrado === null ? null : parseNumber(body.co2_ahorrado);

  if (
    id === null ||
    !Number.isInteger(id) ||
    typeof body.restaurante !== "string" ||
    typeof body.forma_pago !== "string" ||
    total === null ||
    deliveryCost === null ||
    (co2Saved === null && body.co2_ahorrado !== null)
  ) {
    throw new Error("La respuesta del detalle del pedido tiene un formato inesperado.");
  }

  const items = body.detalles.map((item): CustomerOrderDetailItem => {
    if (!isRecord(item)) {
      throw new Error("La respuesta del detalle del pedido tiene un formato inesperado.");
    }

    const itemId = parseNumber(item.id);
    const quantity = parseNumber(item.cantidad);
    const unitPrice = parseNumber(item.precio_unitario);
    const subtotal = parseNumber(item.subtotal);

    if (
      itemId === null ||
      !Number.isInteger(itemId) ||
      typeof item.producto !== "string" ||
      quantity === null ||
      !Number.isInteger(quantity) ||
      unitPrice === null ||
      subtotal === null
    ) {
      throw new Error("La respuesta del detalle del pedido tiene un formato inesperado.");
    }

    return {
      id: itemId,
      product: item.producto,
      quantity,
      unitPrice,
      subtotal,
    };
  });

  return {
    id,
    restaurant: body.restaurante,
    total,
    paymentMethod: body.forma_pago,
    deliveryCost,
    co2Saved,
    items,
  };
}

export async function rateCustomerOrder(
  token: string,
  orderId: number,
  rating: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/calificar`,
    {
      method: "PATCH",
      headers: {
        Authorization: ["Bearer", token].join(" "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ calificacion: rating }),
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
}

export async function confirmCustomerOrderReceived(
  token: string,
  orderId: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/recibido`,
    {
      method: "PATCH",
      headers: { Authorization: ["Bearer", token].join(" ") },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
}

async function updateCustomerOrderStatus(
  token: string,
  orderId: number,
  action: "cancelar" | "no-entregado",
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/ordenes/${encodeURIComponent(orderId)}/${action}`,
    {
      method: "PATCH",
      headers: { Authorization: ["Bearer", token].join(" ") },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (
    !isRecord(body) ||
    !isRecord(body.pedido) ||
    typeof body.pedido.estado_pedido !== "string"
  ) {
    throw new Error("La respuesta al actualizar el pedido tiene un formato inesperado.");
  }
  return body.pedido.estado_pedido;
}

export function cancelCustomerOrder(
  token: string,
  orderId: number,
): Promise<string> {
  return updateCustomerOrderStatus(token, orderId, "cancelar");
}

export function reportCustomerOrderNotReceived(
  token: string,
  orderId: number,
): Promise<string> {
  return updateCustomerOrderStatus(token, orderId, "no-entregado");
}
