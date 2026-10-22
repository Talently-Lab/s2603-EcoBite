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

export interface ClientProfileData {
  nombre: string;
  apellido: string;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");
const USE_MOCK_AUTH = import.meta.env.VITE_DATA_SOURCE !== "api";

const MOCK_USERS: (LoginCredentials & { usuario: AuthUser })[] = [
  {
    email: "cliente@ecobite.com",
    contrasena: "12345678",
    usuario: {
      id: 10,
      email: "cliente@ecobite.com",
      rol: "cliente",
      nombre: "Cliente Demo",
    },
  },
  {
    email: "restaurante@ecobite.com",
    contrasena: "12345678",
    usuario: {
      id: 5,
      email: "restaurante@ecobite.com",
      rol: "restaurante",
    },
  },
  {
    email: "hojayfuego@ecobite.com",
    contrasena: "12345678",
    usuario: {
      id: 6,
      email: "hojayfuego@ecobite.com",
      rol: "restaurante",
    },
  },
  {
    email: "verderaiz@ecobite.com",
    contrasena: "12345678",
    usuario: {
      id: 9,
      email: "verderaiz@ecobite.com",
      rol: "restaurante",
    },
  },
];

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
    throw Object.assign(
      new Error(
        getErrorMessage(responseBody) ??
          `No se pudo crear la cuenta (estado ${response.status}).`,
      ),
      { status: response.status },
    );
  }
}

export async function loginAccount(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  if (USE_MOCK_AUTH) {
    const mockUser = MOCK_USERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
        candidate.contrasena === credentials.contrasena,
    );

    if (!mockUser) {
      throw new Error("Email o contraseña incorrectos");
    }

    return {
      mensaje: "Inicio de sesión correcto (mock)",
      token: `mock-token-${mockUser.usuario.id}`,
      usuario: mockUser.usuario,
    };
  }

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

export async function createClientProfile(
  token: string,
  data: ClientProfileData,
): Promise<ClientProfileData> {
  const response = await fetch(`${API_BASE_URL}/clientes`, {
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
        `No se pudo crear el perfil del cliente (estado ${response.status}).`,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("cliente" in responseBody) ||
    typeof responseBody.cliente !== "object" ||
    responseBody.cliente === null ||
    !("nombre" in responseBody.cliente) ||
    typeof responseBody.cliente.nombre !== "string" ||
    !("apellido" in responseBody.cliente) ||
    typeof responseBody.cliente.apellido !== "string"
  ) {
    throw new Error("El servidor devolvió un perfil de cliente inválido.");
  }

  return {
    nombre: responseBody.cliente.nombre,
    apellido: responseBody.cliente.apellido,
  };
}
