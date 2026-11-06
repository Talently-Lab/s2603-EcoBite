const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export interface RestaurantScheduleApiResponse {
  id: number;
  id_restaurante: number;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
}

export interface RestaurantScheduleData {
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(body: unknown, status: number): string {
  if (isRecord(body)) {
    if (typeof body.error === "string") return body.error;
    if (typeof body.mensaje === "string") return body.mensaje;
  }
  return `No se pudieron actualizar los horarios (estado ${status}).`;
}

function parseSchedules(value: unknown): RestaurantScheduleApiResponse[] {
  if (!Array.isArray(value)) {
    throw new Error("La respuesta de horarios tiene un formato inesperado.");
  }

  return value.map((schedule) => {
    if (
      !isRecord(schedule) ||
      typeof schedule.id !== "number" ||
      typeof schedule.id_restaurante !== "number" ||
      typeof schedule.dia_semana !== "number" ||
      typeof schedule.hora_apertura !== "string" ||
      typeof schedule.hora_cierre !== "string"
    ) {
      throw new Error("La respuesta de horarios tiene un formato inesperado.");
    }
    return {
      id: schedule.id,
      id_restaurante: schedule.id_restaurante,
      dia_semana: schedule.dia_semana,
      hora_apertura: schedule.hora_apertura,
      hora_cierre: schedule.hora_cierre,
    };
  });
}

export async function getRestaurantSchedules(
  restaurantId: number,
  token: string,
  signal?: AbortSignal,
): Promise<RestaurantScheduleApiResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/restaurantes/${encodeURIComponent(restaurantId)}/horarios`,
    {
      headers: { Authorization: ["Bearer", token].join(" ") },
      signal,
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!isRecord(body)) {
    throw new Error("La respuesta de horarios tiene un formato inesperado.");
  }
  return parseSchedules(body.horarios);
}

export async function saveRestaurantSchedules(
  restaurantId: number,
  token: string,
  horarios: RestaurantScheduleData[],
): Promise<RestaurantScheduleApiResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/restaurantes/${encodeURIComponent(restaurantId)}/horarios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ["Bearer", token].join(" "),
      },
      body: JSON.stringify({ horarios }),
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!isRecord(body)) {
    throw new Error("La respuesta al guardar horarios tiene un formato inesperado.");
  }
  return parseSchedules(body.horarios);
}

export async function updateRestaurantSchedule(
  restaurantId: number,
  scheduleId: number,
  token: string,
  schedule: RestaurantScheduleData,
): Promise<RestaurantScheduleApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/restaurantes/${encodeURIComponent(restaurantId)}/horarios/${encodeURIComponent(scheduleId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: ["Bearer", token].join(" "),
      },
      body: JSON.stringify(schedule),
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (!isRecord(body)) {
    throw new Error("La respuesta al actualizar el horario tiene un formato inesperado.");
  }
  return parseSchedules([body.horario])[0];
}

export async function deleteRestaurantSchedule(
  restaurantId: number,
  scheduleId: number,
  token: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/restaurantes/${encodeURIComponent(restaurantId)}/horarios/${encodeURIComponent(scheduleId)}`,
    {
      method: "DELETE",
      headers: { Authorization: ["Bearer", token].join(" ") },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
}
