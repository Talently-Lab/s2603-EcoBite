export type RegistrationAccountType = "cliente" | "restaurante";

export interface RegistrationData {
  email: string;
  contrasena: string;
  canal_adquisicion: string;
}

export interface AuthUser {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  name?: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: AuthUser;
}

export interface LoginCredentials {
  email: string;
  contrasena: string;
}

export interface RestaurantProfileData {
  nombre: string;
  cuit: string;
  categoria: string;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

function getErrorMessage(responseBody: unknown): string | null {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "error" in responseBody &&
    typeof responseBody.error === "string"
  ) {
    return responseBody.error;
  }

  return null;
}

export async function registerAccount(
  accountType: RegistrationAccountType,
  data: RegistrationData,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/usuario/registro-${accountType}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  const responseBody: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody) ??
        `No se pudo crear la cuenta (estado ${response.status}).`,
    );
  }
}

export async function loginAccount(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/usuario/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const responseBody: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody) ??
        `No se pudo iniciar sesión (estado ${response.status}).`,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("token" in responseBody) ||
    typeof responseBody.token !== "string" ||
    !("usuario" in responseBody) ||
    typeof responseBody.usuario !== "object" ||
    responseBody.usuario === null
  ) {
    throw new Error("El servidor devolvió una respuesta de inicio de sesión inválida.");
  }

  return responseBody as LoginResponse;
}

export async function createRestaurantProfile(
  token: string,
  data: RestaurantProfileData,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/restaurantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const responseBody: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody) ??
        `No se pudo crear el perfil del restaurante (estado ${response.status}).`,
    );
  }
}
