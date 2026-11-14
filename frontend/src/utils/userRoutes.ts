import type { AuthUser } from "../services/auth";

function getUserSlug(user: Pick<AuthUser, "id" | "email">): string {
  const username = user.email
    .split("@")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return username || `usuario-${user.id}`;
}

export function getUserDashboardPath(user: AuthUser): string {
  return `/${getUserSlug(user)}/dashboard`;
}

export function getUserSchedulesPath(user: AuthUser): string {
  return `/${getUserSlug(user)}/horarios`;
}

export function getUserOrdersPath(user: AuthUser): string {
  return `/${getUserSlug(user)}/pedidos`;
}
