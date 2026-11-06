import { useState } from "react";
import {
  updateRestaurantOrderStatus,
  type RestaurantOrderAction,
} from "../../services/restaurantOrders";
import { GlobalAlert } from "../ui/GlobalAlert";

export interface RestaurantOrder {
  numero: number;
  cliente: string;
  estado_pedido: string;
  tipo_pago: string;
  total_pedido: number | string;
  hora_aceptacion: string | null;
}

interface RestaurantOrdersListProps {
  orders: RestaurantOrder[];
  token: string;
  onOrderUpdated: () => void;
  allowStatusChanges?: boolean;
  title?: string;
}

function formatCurrency(value: number | string) {
  return `$ ${Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    en_preparacion: "En preparación",
    despachado: "Despachado",
    entregado: "Entregado",
    rechazado: "Rechazado",
    cancelado: "Cancelado",
    cancelado_demora: "Cancelado",
    no_entregado: "No entregado",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  const styles: Record<string, string> = {
    pendiente: "bg-gray-100 text-gray-700",
    en_preparacion: "bg-amber-100 text-amber-800",
    despachado: "bg-teal-100 text-teal-800",
    entregado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-700",
    cancelado: "bg-red-100 text-red-700",
    cancelado_demora: "bg-red-100 text-red-700",
    no_entregado: "bg-red-100 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-700";
}

function formatPayment(paymentMethod: string) {
  const labels: Record<string, string> = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
  };
  return labels[paymentMethod] ?? paymentMethod;
}

function formatAcceptedTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function getAllowedActions(status: string) {
  if (status === "pendiente") {
    return [
      { value: "en_preparacion", label: "Aceptar pedido", action: "aceptar" },
      { value: "rechazado", label: "Rechazar pedido", action: "rechazar" },
    ] as const;
  }
  if (status === "en_preparacion") {
    return [
      { value: "despachado", label: "Marcar despachado", action: "despachar" },
    ] as const;
  }
  return [];
}

export function RestaurantOrdersList({
  orders,
  token,
  onOrderUpdated,
  allowStatusChanges = false,
  title = "Últimos pedidos",
}: RestaurantOrdersListProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(
    orderId: number,
    action: RestaurantOrderAction,
  ) {
    if (
      action === "rechazar" &&
      !window.confirm("¿Querés rechazar este pedido?")
    ) {
      return;
    }

    setError(null);
    setUpdatingOrderId(orderId);
    try {
      await updateRestaurantOrderStatus(token, orderId, action);
      onOrderUpdated();
    } catch (actionError: unknown) {
      setError(
        actionError instanceof TypeError
          ? "No se pudo conectar con el servidor. Intentá nuevamente."
          : actionError instanceof Error
            ? actionError.message
            : "No se pudo actualizar el estado del pedido.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-eco-dark">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">Los 5 pedidos más recientes</p>
      {error && <GlobalAlert className="mt-3" message={error} />}
      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">Todavía no hay pedidos.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table
            className={`w-full ${allowStatusChanges ? "min-w-[44rem]" : "min-w-[38rem]"} text-left text-xs`}
          >
            <thead>
              <tr className="border-b border-gray-200 text-[9px] uppercase tracking-wide text-gray-500">
                <th className="px-2 py-2 font-medium">N.º</th>
                <th className="px-2 py-2 font-medium">Cliente</th>
                <th className="px-2 py-2 font-medium">Estado</th>
                <th className="px-2 py-2 font-medium">Pago</th>
                <th className="px-2 py-2 text-right font-medium">Total</th>
                <th className="px-2 py-2 font-medium">Hora</th>
                {allowStatusChanges && (
                  <th className="px-2 py-2 font-medium">Cambiar estado</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const actions = allowStatusChanges
                  ? getAllowedActions(order.estado_pedido)
                  : [];
                return (
                  <tr
                    key={order.numero}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-2 py-2.5 font-semibold text-eco-dark">
                      #{order.numero}
                    </td>
                    <td className="px-2 py-2.5 text-gray-700">{order.cliente}</td>
                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${statusStyle(order.estado_pedido)}`}
                      >
                        {formatStatus(order.estado_pedido)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-gray-700">
                      {formatPayment(order.tipo_pago)}
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold text-eco-dark">
                      {formatCurrency(order.total_pedido)}
                    </td>
                    <td className="px-2 py-2.5 text-gray-500">
                      {formatAcceptedTime(order.hora_aceptacion)}
                    </td>
                    {allowStatusChanges && (
                      <td className="px-2 py-2.5">
                        <select
                          aria-label={`Cambiar estado del pedido ${order.numero}`}
                          value=""
                          disabled={actions.length === 0 || updatingOrderId !== null}
                          onChange={(event) => {
                            const selectedAction = actions.find(
                              (item) => item.value === event.currentTarget.value,
                            );
                            if (selectedAction) {
                              void handleStatusChange(
                                order.numero,
                                selectedAction.action,
                              );
                            }
                          }}
                          className="w-36 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">
                            {updatingOrderId === order.numero
                              ? "Actualizando..."
                              : actions.length
                                ? "Elegir acción"
                                : "Sin acciones"}
                          </option>
                          {actions.map((action) => (
                            <option key={action.action} value={action.value}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
