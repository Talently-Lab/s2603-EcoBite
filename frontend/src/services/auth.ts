export type RegistrationAccountType = "cliente" | "restaurante";

export interface RegistrationData {
  email: string;
  contrasena: string;
  canal_adquisicion: string;
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
