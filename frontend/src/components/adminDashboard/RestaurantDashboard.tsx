import { useEffect, useState } from "react";
import { Cloud, ShoppingBag, ShoppingBasket } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatedCo2Value } from "./AnimatedCo2Value";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardError } from "./DashboardError";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardLoading } from "./DashboardLoading";
import { MetricCard } from "./MetricCard";
import { RestaurantProductForm } from "./RestaurantProductForm";
import {
  RestaurantOrdersList,
  type RestaurantOrder,
} from "./RestaurantOrdersList";
import { getRestaurants } from "../../services/restaurants";
import { GlobalAlert } from "../ui/GlobalAlert";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

interface DashboardStats {
  pedidos_recibidos: number | string;
  ventas_entregadas: number | string;
  co2_total_ahorrado: number | string;
  variaciones: {
    pedidos_recibidos: DashboardVariation;
    ventas_entregadas: DashboardVariation;
    co2_total_ahorrado: DashboardVariation;
  };
  pedidos_por_estado: {
    estado_pedido: string;
    cantidad_pedidos: number | string;
  }[];
  ventas_por_dia: {
    dia: string;
    ventas_del_dia: number | string;
  }[];
  productos_mas_vendidos: {
    producto: string;
    unidades_vendidas: number | string;
  }[];
  calificaciones: {
    calificacion_promedio: number | string | null;
    total_calificaciones: number | string;
  };
  distribucion_calificaciones: {
    calificacion: number | string;
    cantidad_calificaciones: number | string;
  }[];
  ultimos_pedidos: RestaurantOrder[];
}

interface DashboardVariation {
  porcentaje: number | null;
  direccion: "subio" | "bajo" | "igual" | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumericValue(value: unknown): value is number | string {
  return (
    (typeof value === "number" || typeof value === "string") &&
    Number.isFinite(Number(value))
  );
}

function isNumericOrNull(value: unknown): value is number | string | null {
  return value === null || isNumericValue(value);
}

function parseDashboardVariation(value: unknown): DashboardVariation {
  if (
    !isRecord(value) ||
    !isNumericOrNull(value.porcentaje) ||
    !(
      value.direccion === null ||
      value.direccion === "subio" ||
      value.direccion === "bajo" ||
      value.direccion === "igual"
    )
  ) {
    throw new Error("La respuesta del dashboard no tiene el formato esperado.");
  }

  return {
    porcentaje:
      value.porcentaje === null ? null : Number(value.porcentaje),
    direccion: value.direccion,
  };
}

function parseDashboardStats(value: unknown): DashboardStats {
  if (
    !isRecord(value) ||
    !isRecord(value.estadisticas) ||
    !isNumericValue(value.estadisticas.pedidos_recibidos) ||
    !isNumericValue(value.estadisticas.ventas_entregadas) ||
    !isNumericValue(value.estadisticas.co2_total_ahorrado) ||
    !Array.isArray(value.estadisticas.pedidos_por_estado) ||
    !value.estadisticas.pedidos_por_estado.every(
      (item) =>
        isRecord(item) &&
        typeof item.estado_pedido === "string" &&
        isNumericValue(item.cantidad_pedidos),
    ) ||
    !Array.isArray(value.estadisticas.ventas_por_dia) ||
    !value.estadisticas.ventas_por_dia.every(
      (item) =>
        isRecord(item) &&
        typeof item.dia === "string" &&
        isNumericValue(item.ventas_del_dia),
    ) ||
    !Array.isArray(value.estadisticas.productos_mas_vendidos) ||
    !value.estadisticas.productos_mas_vendidos.every(
      (item) =>
        isRecord(item) &&
        typeof item.producto === "string" &&
        isNumericValue(item.unidades_vendidas),
    ) ||
    !isRecord(value.estadisticas.calificaciones) ||
    !isNumericOrNull(value.estadisticas.calificaciones.calificacion_promedio) ||
    !isNumericValue(value.estadisticas.calificaciones.total_calificaciones) ||
    !Array.isArray(value.estadisticas.distribucion_calificaciones) ||
    !value.estadisticas.distribucion_calificaciones.every(
      (item) =>
        isRecord(item) &&
        isNumericValue(item.calificacion) &&
        isNumericValue(item.cantidad_calificaciones),
    ) ||
    !Array.isArray(value.estadisticas.ultimos_pedidos) ||
    !value.estadisticas.ultimos_pedidos.every(
      (order) =>
        isRecord(order) &&
        isNumericValue(order.numero) &&
        typeof order.cliente === "string" &&
        typeof order.estado_pedido === "string" &&
        typeof order.tipo_pago === "string" &&
        isNumericValue(order.total_pedido) &&
        (order.hora_aceptacion === null ||
          typeof order.hora_aceptacion === "string"),
    )
  ) {
    throw new Error("La respuesta del dashboard no tiene el formato esperado.");
  }

  return {
    pedidos_recibidos: value.estadisticas.pedidos_recibidos,
    ventas_entregadas: value.estadisticas.ventas_entregadas,
    co2_total_ahorrado: value.estadisticas.co2_total_ahorrado,
    variaciones: {
      pedidos_recibidos: parseDashboardVariation(
        isRecord(value.estadisticas.variaciones)
          ? value.estadisticas.variaciones.pedidos_recibidos
          : undefined,
      ),
      ventas_entregadas: parseDashboardVariation(
        isRecord(value.estadisticas.variaciones)
          ? value.estadisticas.variaciones.ventas_entregadas
          : undefined,
      ),
      co2_total_ahorrado: parseDashboardVariation(
        isRecord(value.estadisticas.variaciones)
          ? value.estadisticas.variaciones.co2_total_ahorrado
          : undefined,
      ),
    },
    pedidos_por_estado: value.estadisticas.pedidos_por_estado.map((item) => ({
      estado_pedido: item.estado_pedido,
      cantidad_pedidos: item.cantidad_pedidos,
    })),
    ventas_por_dia: value.estadisticas.ventas_por_dia.map((item) => ({
      dia: item.dia,
      ventas_del_dia: item.ventas_del_dia,
    })),
    productos_mas_vendidos:
      value.estadisticas.productos_mas_vendidos.map((item) => ({
        producto: item.producto,
        unidades_vendidas: item.unidades_vendidas,
      })),
    calificaciones: {
      calificacion_promedio:
        value.estadisticas.calificaciones.calificacion_promedio,
      total_calificaciones:
        value.estadisticas.calificaciones.total_calificaciones,
    },
    distribucion_calificaciones:
      value.estadisticas.distribucion_calificaciones.map((item) => ({
        calificacion: item.calificacion,
        cantidad_calificaciones: item.cantidad_calificaciones,
      })),
    ultimos_pedidos: value.estadisticas.ultimos_pedidos.map((order) => ({
      numero: Number(order.numero),
      cliente: order.cliente,
      estado_pedido: order.estado_pedido,
      tipo_pago: order.tipo_pago,
      total_pedido: order.total_pedido,
      hora_aceptacion: order.hora_aceptacion,
    })),
  };
}

function formatCurrency(value: number | string) {
  return `$ ${Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDay(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : String(date.getDate()).padStart(2, "0");
}

function getChartStep(maximum: number) {
  const rawStep = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalizedStep = rawStep / magnitude;
  const niceStep =
    normalizedStep <= 1
      ? 1
      : normalizedStep <= 1.5
        ? 1.5
        : normalizedStep <= 2
          ? 2
          : normalizedStep <= 2.5
            ? 2.5
            : normalizedStep <= 3
              ? 3
              : normalizedStep <= 4
                ? 4
                : normalizedStep <= 5
                  ? 5
                  : normalizedStep <= 6
                    ? 6
                    : normalizedStep <= 8
                      ? 8
                      : 10;

  return niceStep * magnitude;
}

function SalesByDayChart({
  sales,
  month,
}: {
  sales: DashboardStats["ventas_por_dia"];
  month: string;
}) {
  const width = 600;
  const height = 190;
  const left = 60;
  const right = 10;
  const top = 10;
  const bottom = 28;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maximum = Math.max(...sales.map((item) => Number(item.ventas_del_dia)), 0);
  const step = getChartStep(maximum || 1);
  const scaleMaximum = step * 4;
  const points = sales.map((item, index) => ({
    x: left + (sales.length <= 1 ? 0 : (index / (sales.length - 1)) * plotWidth),
    y:
      top +
      plotHeight -
      (Number(item.ventas_del_dia) / scaleMaximum) * plotHeight,
    amount: Number(item.ventas_del_dia),
    date: item.dia,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${left},${top + plotHeight} ${line} ${left + plotWidth},${top + plotHeight}`;
  const bestPointIndex = points.reduce(
    (bestIndex, point, index) =>
      point.amount > points[bestIndex].amount ? index : bestIndex,
    0,
  );
  const bestPoint = points[bestPointIndex];
  const monthDate = new Date(`${month}-01T00:00:00`);
  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
  }).format(monthDate);
  const startDay = sales[0] ? formatDay(sales[0].dia) : "1";
  const endDay = sales.length ? formatDay(sales[sales.length - 1].dia) : "";
  const dateLabels = [...new Set(
    Array.from({ length: 5 }, (_, index) =>
      Math.round((index * Math.max(sales.length - 1, 0)) / 4),
    ),
  )];
  const dateLabelFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
      <h2 className="text-sm font-bold text-eco-dark">Ventas por día</h2>
      <p className="mt-1 text-[10px] text-gray-500">
        {startDay} al {endDay} de {monthName} · en pesos argentinos
      </p>
      <svg
        aria-label="Gráfico de ventas por día"
        className="mt-2 h-48 w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = scaleMaximum - tick * step;
          const y = top + (tick / 4) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={left - 8}
                y={y + 3}
                fill="#6b7280"
                fontSize="9"
                textAnchor="end"
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="#e7f0dc" />
        <polyline
          points={line}
          fill="none"
          stroke="#123f37"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
        />
        {bestPoint && bestPoint.amount > 0 && (
          <g>
            <circle
              cx={bestPoint.x}
              cy={bestPoint.y}
              r="3.5"
              fill="white"
              stroke="#123f37"
              strokeWidth="2"
            >
              <title>
                {`Mejor día: ${formatCurrency(bestPoint.amount)} (${bestPoint.date})`}
              </title>
            </circle>
            <text
              x={Math.max(left + 4, Math.min(bestPoint.x, width - right - 4))}
              y={Math.max(top + 10, bestPoint.y - 9)}
              fill="#123f37"
              fontSize="9"
              fontWeight="600"
              textAnchor={bestPoint.x > width - 150 ? "end" : "middle"}
            >
              {`Mejor día: ${formatCurrency(bestPoint.amount)}`}
            </text>
          </g>
        )}
        {dateLabels.map((index) => {
          const point = points[index];
          if (!point) return null;
          const date = new Date(`${point.date.slice(0, 10)}T00:00:00`);
          const label = Number.isNaN(date.getTime())
            ? point.date
            : dateLabelFormatter.format(date).replace(".", "");
          return (
            <text
              key={point.date}
              x={point.x}
              y={height - 5}
              fill="#6b7280"
              fontSize="9"
              textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </section>
  );
}

function OrdersByStatusChart({
  orders,
}: {
  orders: DashboardStats["pedidos_por_estado"];
}) {
  const colors: Record<string, string> = {
    entregado: "#073f37",
    en_preparacion: "#85501c",
    despachado: "#638c7d",
    pendiente: "#9bb6a5",
    cancelado: "#bd3434",
    cancelado_demora: "#bd3434",
    rechazado: "#bd3434",
    no_entregado: "#8f2222",
  };
  const orderedStatuses = [
    "entregado",
    "en_preparacion",
    "despachado",
    "pendiente",
    "cancelado",
    "cancelado_demora",
    "rechazado",
    "no_entregado",
  ];
  const sortedOrders = [...orders].sort((a, b) => {
    const aIndex = orderedStatuses.indexOf(a.estado_pedido);
    const bIndex = orderedStatuses.indexOf(b.estado_pedido);
    return (aIndex < 0 ? orderedStatuses.length : aIndex) -
      (bIndex < 0 ? orderedStatuses.length : bIndex);
  });
  const total = sortedOrders.reduce(
    (sum, item) => sum + Number(item.cantidad_pedidos),
    0,
  );
  const delivered = Number(
    sortedOrders.find((item) => item.estado_pedido === "entregado")
      ?.cantidad_pedidos ?? 0,
  );
  const deliveredPercentage = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const chartSegments = sortedOrders.reduce<{
    offset: number;
    segments: {
      status: string;
      count: number;
      length: number;
      offset: number;
    }[];
  }>(
    (result, item) => {
      const count = Number(item.cantidad_pedidos);
      const length = total > 0 ? (count / total) * circumference : 0;
      return {
        offset: result.offset + length,
        segments: [
          ...result.segments,
          {
            status: item.estado_pedido,
            count,
            length,
            offset: result.offset,
          },
        ],
      };
    },
    { offset: 0, segments: [] },
  ).segments;

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      entregado: "Entregado",
      en_preparacion: "En preparación",
      despachado: "Despachado",
      pendiente: "Pendiente",
      cancelado: "Cancelado",
      cancelado_demora: "Cancelado por demora",
      rechazado: "Rechazado",
      no_entregado: "No entregado",
    };
    return labels[status] ?? status.replaceAll("_", " ");
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-eco-dark">Pedidos por estado</h2>
      <p className="mt-1 text-[10px] text-gray-500">
        {total} pedidos en el mes
      </p>
      <div className="relative mx-auto mt-2 flex h-28 w-28 items-center justify-center">
        <svg
          aria-label={`${deliveredPercentage}% de los pedidos entregados`}
          className="h-full w-full -rotate-90"
          role="img"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#edf0ec"
            strokeWidth="11"
          />
          {chartSegments.map((segment) => {
            return (
              <circle
                key={segment.status}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={colors[segment.status] ?? "#8b9b91"}
                strokeWidth="11"
                strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                strokeDashoffset={-segment.offset}
              >
                <title>{`${getStatusLabel(segment.status)}: ${segment.count} pedidos`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute flex flex-col items-center text-center">
          <span className="text-base font-bold leading-tight text-eco-dark">
            {deliveredPercentage} %
          </span>
          <span className="text-[8px] text-gray-600">entregados</span>
        </div>
      </div>
      <ul className="mt-2 space-y-1">
        {sortedOrders.map((item) => {
          const count = Number(item.cantidad_pedidos);
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li
              key={item.estado_pedido}
              className="flex items-center gap-1.5 text-[9px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor: colors[item.estado_pedido] ?? "#8b9b91",
                }}
              />
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {getStatusLabel(item.estado_pedido)}
              </span>
              <span className="whitespace-nowrap font-semibold text-eco-dark">
                {count} · {percentage} %
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function RestaurantDashboard({
  token,
  restaurantUserId,
}: {
  token: string;
  restaurantUserId: number;
}) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [restaurantName, setRestaurantName] = useState<string>();
  const [restaurantSlug, setRestaurantSlug] = useState<string>();
  const [restaurantId, setRestaurantId] = useState<number>();
  const [restaurantLookupError, setRestaurantLookupError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [searchParams] = useSearchParams();
  const isProductsTab = searchParams.get("tab") === "products";
  const isOrdersTab = searchParams.get("tab") === "orders";

  useEffect(() => {
    let active = true;

    async function loadRestaurantName() {
      try {
        const restaurants = await getRestaurants();
        const restaurant = restaurants.find(
          (item) => item.userId === restaurantUserId,
        );
        if (!restaurant) {
          throw new Error("No se encontró el restaurante de esta cuenta.");
        }
        if (active) {
          setRestaurantName(restaurant.name);
          setRestaurantSlug(restaurant.slug);
          setRestaurantId(Number(restaurant.id));
        }
      } catch (loadError: unknown) {
        if (!active) return;
        console.error("No se pudo cargar el nombre del restaurante.", loadError);
        setRestaurantLookupError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los datos del restaurante.",
        );
      }
    }

    void loadRestaurantName();
    return () => {
      active = false;
    };
  }, [restaurantUserId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard/stats?mes=${encodeURIComponent(month)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            isRecord(body) && typeof body.mensaje === "string"
              ? body.mensaje
              : `No se pudieron cargar las estadísticas (estado ${response.status}).`;
          throw new Error(message);
        }
        setStats(parseDashboardStats(body));
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las estadísticas.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadStats();
    return () => controller.abort();
  }, [month, retryCount, token]);

  function openMonthPicker() {
    const monthInput = document.getElementById("dashboard-month");
    if (!(monthInput instanceof HTMLInputElement)) return;
    if (typeof monthInput.showPicker === "function") {
      monthInput.showPicker();
    } else {
      monthInput.focus();
    }
  }

  const noOrders = stats !== null && Number(stats.pedidos_recibidos) === 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <DashboardHeader
        restaurantName={restaurantName}
        month={month}
        loading={loading}
        error={error}
        onMonthChange={setMonth}
      />

      {!isProductsTab && error && (
        <DashboardError
          message={error}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}
      {!isProductsTab && loading && <DashboardLoading />}

      {!isProductsTab && !isOrdersTab && !loading && stats && (
        <div
          aria-label="Resumen del restaurante"
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <section
            aria-label="Indicadores del restaurante"
            className="grid gap-4 md:col-span-3 md:grid-cols-3"
          >
            <MetricCard
              label="Ventas entregadas"
              value={formatCurrency(stats.ventas_entregadas)}
              icon={<span className="text-[10px] font-semibold">$</span>}
              variation={{
                percentage: stats.variaciones.ventas_entregadas.porcentaje,
                direction: stats.variaciones.ventas_entregadas.direccion,
              }}
            />
            <MetricCard
              label="Pedidos recibidos"
              value={String(stats.pedidos_recibidos)}
              icon={<ShoppingBag aria-hidden="true" className="h-3 w-3" />}
              variation={{
                percentage: stats.variaciones.pedidos_recibidos.porcentaje,
                direction: stats.variaciones.pedidos_recibidos.direccion,
              }}
            />
            <MetricCard
              label="CO₂ ahorrado"
              value={
                noOrders ? (
                  "0 kg"
                ) : (
                  <AnimatedCo2Value value={stats.co2_total_ahorrado} />
                )
              }
              icon={<Cloud aria-hidden="true" className="h-3 w-3" />}
              variation={{
                percentage: stats.variaciones.co2_total_ahorrado.porcentaje,
                direction: stats.variaciones.co2_total_ahorrado.direccion,
              }}
            />
          </section>

          {noOrders ? (
            <section className="mt-0 flex min-h-52 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-7 text-center md:col-span-3">
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-eco-light/70 text-eco-dark">
                <ShoppingBasket aria-hidden="true" className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-eco-dark">
                Todavía no recibiste pedidos en este mes
              </h2>
              <p className="mt-2 max-w-sm text-[11px] leading-snug text-gray-600">
                Cuando llegue tu primer pedido vas a ver acá tus ventas y el CO₂
                que ahorraste. Probá con otro período o revisá que tu menú y tus
                horarios estén cargados.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Link
                  to={
                    restaurantSlug
                      ? `/restaurantes/${encodeURIComponent(restaurantSlug)}`
                      : "/restaurantes"
                  }
                  className="rounded-md border border-eco-dark bg-eco-dark px-3 py-1.5 text-[11px] font-bold text-white hover:bg-eco-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-dark"
                >
                  Ver mis productos
                </Link>
                <button
                  type="button"
                  className="rounded-md border border-eco-dark px-3 py-1.5 text-[11px] font-bold text-eco-dark hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-dark"
                  onClick={openMonthPicker}
                >
                  Cambiar de mes
                </button>
              </div>
            </section>
          ) : (
            <>
          {stats.ventas_por_dia.length === 0 ? (
            <DashboardPanel
              title="Ventas por día"
              className="md:col-span-2"
            >
              <p className="mt-4 text-sm text-gray-600">
                No hay ventas para este mes.
              </p>
            </DashboardPanel>
          ) : (
            <SalesByDayChart sales={stats.ventas_por_dia} month={month} />
          )}

          <OrdersByStatusChart orders={stats.pedidos_por_estado} />

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
            <h2 className="text-sm font-bold text-eco-dark">
              Productos más vendidos
            </h2>
            <p className="mt-1 text-[10px] text-gray-500">
              Unidades vendidas en el mes
            </p>
            {stats.productos_mas_vendidos.length === 0 ? (
              <p className="mt-4 text-xs text-gray-600">
                No hay productos vendidos en este mes.
              </p>
            ) : (
              <ol className="mt-2 space-y-0.5">
                {stats.productos_mas_vendidos.map((item, index) => {
                  const maximum = Math.max(
                    ...stats.productos_mas_vendidos.map((product) =>
                      Number(product.unidades_vendidas),
                    ),
                    1,
                  );
                  return (
                    <li
                      key={item.producto}
                      className="grid grid-cols-[12px_minmax(70px,130px)_minmax(40px,1fr)_30px] items-center gap-2 py-1.5 text-[10px]"
                    >
                      <span className="text-gray-600">{index + 1}</span>
                      <span className="truncate text-gray-700" title={item.producto}>
                        {item.producto}
                      </span>
                      <div
                        className="h-1.5 rounded-full bg-gray-100"
                        aria-label={`${item.unidades_vendidas} unidades vendidas`}
                      >
                        <div
                          className="h-full rounded-full bg-eco-dark"
                          style={{
                            width: `${(Number(item.unidades_vendidas) / maximum) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-right font-semibold text-eco-dark">
                        {item.unidades_vendidas} u.
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-eco-dark">
              Calificación de tus clientes
            </h2>
            <p className="mt-1 text-[10px] text-gray-500">Promedio del mes</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold leading-none text-eco-dark">
                {stats.calificaciones.calificacion_promedio === null
                  ? "—"
                  : Number(
                      stats.calificaciones.calificacion_promedio,
                    ).toFixed(1)}
              </span>
              <div>
                <span
                  aria-label={
                    stats.calificaciones.calificacion_promedio === null
                      ? "Sin calificaciones"
                      : `${Number(stats.calificaciones.calificacion_promedio).toFixed(1)} de 5 estrellas`
                  }
                  className="text-[13px] leading-none tracking-tight text-amber-500"
                >
                  ★★★★★
                </span>
                <p className="mt-0.5 text-[9px] text-gray-500">
                  {stats.calificaciones.total_calificaciones} reseñas
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const rating = stats.distribucion_calificaciones.find(
                    (item) => Number(item.calificacion) === stars,
                  );
                  const count = Number(rating?.cantidad_calificaciones ?? 0);
                  const total = Number(stats.calificaciones.total_calificaciones);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                  <li
                    key={stars}
                    className="flex items-center gap-2 text-[9px]"
                  >
                    <span className="w-[66px] text-gray-600">
                      {stars} {stars === 1 ? "estrella" : "estrellas"}
                    </span>
                    <div
                      className="h-1.5 flex-1 rounded-full bg-gray-100"
                      aria-label={`${Math.round(percentage)}%`}
                    >
                      <div
                        className="h-1.5 rounded-full bg-eco-dark"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-7 text-right font-semibold text-eco-dark">
                      {Math.round(percentage)} %
                    </span>
                  </li>
                  );
                })}
            </ul>
          </section>

          <div className="md:col-span-3">
            <RestaurantOrdersList
              orders={stats.ultimos_pedidos}
              token={token}
              onOrderUpdated={() => setRetryCount((count) => count + 1)}
            />
          </div>
            </>
          )}
        </div>
      )}

      {isOrdersTab && !loading && stats && (
        <div className="mt-8">
          <RestaurantOrdersList
            orders={stats.ultimos_pedidos}
            token={token}
            title="Pedidos"
            allowStatusChanges
            onOrderUpdated={() => setRetryCount((count) => count + 1)}
          />
        </div>
      )}

      {isProductsTab &&
        (restaurantLookupError ? (
          <GlobalAlert
            message={restaurantLookupError}
            className="mx-auto mt-8 max-w-2xl"
          />
        ) : restaurantId ? (
          <RestaurantProductForm restaurantId={restaurantId} token={token} />
        ) : (
          <GlobalAlert
            message="Cargando los datos de tu restaurante..."
            variant="info"
            className="mx-auto mt-8 max-w-2xl"
          />
        ))}

    </main>
  );
}
