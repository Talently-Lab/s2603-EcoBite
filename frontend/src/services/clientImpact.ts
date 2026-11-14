const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export interface ClientImpact {
  co2_total_ahorrado: number;
  pedidos_entregados: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNonNegativeNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("El servidor devolvió indicadores de impacto inválidos.");
  }
  return parsed;
}

function getErrorMessage(body: unknown, status: number): string {
  if (isRecord(body)) {
    if (typeof body.mensaje === "string") return body.mensaje;
    if (typeof body.error === "string") return body.error;
  }
  return `No se pudo cargar tu impacto (estado ${status}).`;
}

export async function getClientImpact(
  token: string,
  signal?: AbortSignal,
): Promise<ClientImpact> {
  const response = await fetch(`${API_BASE_URL}/dashboard/impacto/cliente`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!isRecord(body) || !isRecord(body.impacto)) {
    throw new Error("El servidor devolvió datos de impacto inválidos.");
  }

  return {
    co2_total_ahorrado: parseNonNegativeNumber(
      body.impacto.co2_total_ahorrado,
    ),
    pedidos_entregados: parseNonNegativeNumber(
      body.impacto.pedidos_entregados,
    ),
  };
}
