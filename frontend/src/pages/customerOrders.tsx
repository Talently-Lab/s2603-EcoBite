import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  cancelCustomerOrder,
  confirmCustomerOrderReceived,
  getCustomerOrderDetails,
  listCustomerOrders,
  rateCustomerOrder,
  reportCustomerOrderNotReceived,
  type CustomerOrder,
  type CustomerOrderDetails,
} from "../services/customerOrders";
import Modal from "../components/modal/Modal";
import Button from "../components/ui/Button";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { Loader } from "../components/ui/Loader";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function isDelivered(order: CustomerOrder): boolean {
  return order.status.trim().toLowerCase() === "entregado";
}

function canCancel(order: CustomerOrder): boolean {
  return ["pendiente", "en_preparacion"].includes(
    order.status.trim().toLowerCase(),
  );
}

function getStatusLabel(status: string): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("es-AR"));
}

type CustomerOrderAction =
  | { type: "cancel"; order: CustomerOrder }
  | { type: "notReceived"; order: CustomerOrder };

function getRatingsStorageKey(userId: number): string {
  return `ecobite:customer-ratings:${userId}`;
}

function parseStoredRatings(value: string | null): Record<number, number> {
  if (!value) return {};

  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Los datos locales de calificaciones tienen un formato inválido.");
  }

  const ratings: Record<number, number> = {};
  for (const [orderId, rating] of Object.entries(parsed)) {
    if (
      Number.isInteger(Number(orderId)) &&
      typeof rating === "number" &&
      Number.isInteger(rating) &&
      rating >= 1 &&
      rating <= 5
    ) {
      ratings[Number(orderId)] = rating;
    }
  }
  return ratings;
}

function loadStoredRatings(userId: number): {
  ratings: Record<number, number>;
  error: string | null;
} {
  try {
    return {
      ratings: parseStoredRatings(
        localStorage.getItem(getRatingsStorageKey(userId)),
      ),
      error: null,
    };
  } catch {
    return {
      ratings: {},
      error:
        "No se pudieron recuperar las calificaciones guardadas en este navegador.",
    };
  }
}

export function CustomerOrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ratedOrders, setRatedOrders] = useState<Record<number, number>>({});
  const [ratingStorageError, setRatingStorageError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<CustomerOrderDetails | null>(
    null,
  );
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsRetryCount, setDetailsRetryCount] = useState(0);
  const [pendingAction, setPendingAction] = useState<CustomerOrderAction | null>(
    null,
  );
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const storedRatings = user?.id
    ? loadStoredRatings(user.id)
    : { ratings: {}, error: null };
  const ratingStorageMessage = ratingStorageError ?? storedRatings.error;
  const detailsLoading =
    detailOrderId !== null && orderDetails === null && detailsError === null;

  useEffect(() => {
    if (!detailOrderId || !token) return;

    const controller = new AbortController();

    getCustomerOrderDetails(token, detailOrderId, controller.signal)
      .then(setOrderDetails)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setDetailsError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle del pedido.",
        );
      })

    return () => controller.abort();
  }, [detailOrderId, detailsRetryCount, token]);

  useEffect(() => {
    if (authLoading || !token || user?.rol !== "cliente") return;

    let isCurrent = true;
    listCustomerOrders(token)
      .then((customerOrders) => {
        if (isCurrent) setOrders(customerOrders);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar tus pedidos.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [authLoading, retryCount, token, user?.rol]);

  if (authLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Verificando sesión" />
      </main>
    );
  }

  if (user?.rol !== "cliente") return <Navigate to="/" replace />;

  function openRatingModal(order: CustomerOrder) {
    setSelectedOrder(order);
    setRating(0);
    setRatingError(null);
  }

  function closeRatingModal() {
    if (isSubmitting) return;
    setSelectedOrder(null);
    setRating(0);
    setRatingError(null);
  }

  function retryLoadingOrders() {
    setIsLoading(true);
    setLoadError(null);
    setRetryCount((count) => count + 1);
  }

  function closeDetailsModal() {
    setDetailOrderId(null);
    setOrderDetails(null);
    setDetailsError(null);
  }

  function openDetailsModal(orderId: number) {
    setOrderDetails(null);
    setDetailsError(null);
    setDetailOrderId(orderId);
  }

  async function confirmReceived(order: CustomerOrder) {
    if (!token || confirmingOrderId !== null) return;

    setConfirmingOrderId(order.id);
    setDeliveryError(null);
    try {
      await confirmCustomerOrderReceived(token, order.id);
      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id ? { ...item, status: "entregado" } : item,
        ),
      );
    } catch (error: unknown) {
      setDeliveryError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la recepción. Intentá nuevamente.",
      );
    } finally {
      setConfirmingOrderId(null);
    }
  }

  async function submitOrderAction() {
    if (!pendingAction || !token || confirmingOrderId !== null) return;

    const { order, type } = pendingAction;
    setConfirmingOrderId(order.id);
    setActionError(null);
    try {
      const status =
        type === "cancel"
          ? await cancelCustomerOrder(token, order.id)
          : await reportCustomerOrderNotReceived(token, order.id);
      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id ? { ...item, status } : item,
        ),
      );
      setPendingAction(null);
    } catch (error: unknown) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el pedido. Intentá nuevamente.",
      );
    } finally {
      setConfirmingOrderId(null);
    }
  }

  async function submitRating() {
    const userId = user?.id;
    if (!selectedOrder || !token || !userId || rating < 1 || rating > 5) return;

    setIsSubmitting(true);
    setRatingError(null);
    try {
      await rateCustomerOrder(token, selectedOrder.id, rating);
      const nextRatings = { ...ratedOrders, [selectedOrder.id]: rating };
      setRatedOrders(nextRatings);
      try {
        localStorage.setItem(
          getRatingsStorageKey(userId),
          JSON.stringify(nextRatings),
        );
        setRatingStorageError(null);
      } catch {
        setRatingStorageError(
          "La calificación se envió, pero no se pudo guardar en este navegador. Podría volver a aparecer al recargar.",
        );
      }
      setSelectedOrder(null);
      setRating(0);
    } catch (error: unknown) {
      setRatingError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar tu calificación. Intentá nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="text-3xl font-bold text-eco-dark sm:text-4xl">
        Mis pedidos
      </h1>
      <p className="mt-3 text-eco-text-secondary">
        Consultá el estado de tus compras y calificá tus pedidos entregados.
      </p>
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="light"
          disabled={isLoading}
          onClick={retryLoadingOrders}
        >
          {isLoading ? "Actualizando..." : "Actualizar pedidos"}
        </Button>
      </div>

      {deliveryError && (
        <div className="mt-4">
          <GlobalAlert message={deliveryError} />
        </div>
      )}
      {actionError && (
        <div className="mt-4">
          <GlobalAlert message={actionError} />
        </div>
      )}
      {ratingStorageMessage && (
        <div className="mt-4">
          <GlobalAlert message={ratingStorageMessage} variant="info" />
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader label="Cargando tus pedidos" />
        </div>
      ) : loadError ? (
        <div className="mt-8 space-y-4">
          <GlobalAlert message={loadError} />
          <Button type="button" onClick={retryLoadingOrders}>
            Reintentar
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-eco-border bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">Todavía no tenés pedidos</h2>
          <p className="mt-2 text-sm text-eco-text-secondary">
            Cuando hagas una compra, vas a poder consultar su estado desde acá.
          </p>
          <Link
            to="/restaurantes"
            className="mt-5 inline-block font-semibold text-eco-dark underline underline-offset-4"
          >
            Explorar restaurantes
          </Link>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const submittedRating =
              ratedOrders[order.id] ?? storedRatings.ratings[order.id];
            const delivered = isDelivered(order);
            const isDispatched =
              order.status.trim().toLowerCase() === "despachado";

            return (
              <li
                key={order.id}
                className="rounded-2xl border border-eco-border bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-eco-text-secondary">
                      Pedido #{order.id}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-eco-dark">
                      {order.restaurant}
                    </h2>
                    <p className="mt-2 text-sm text-eco-text-secondary">
                      {Number.isNaN(Date.parse(order.createdAt))
                        ? "Fecha no disponible"
                        : dateFormatter.format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                      delivered
                        ? "bg-green-100 text-green-800"
                        : "bg-eco-light/30 text-eco-dark"
                    }`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-eco-border pt-4">
                  <div className="text-sm text-eco-text-secondary">
                    <span>{getStatusLabel(order.paymentMethod)}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-semibold text-eco-dark">
                      {currencyFormatter.format(order.total)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => openDetailsModal(order.id)}
                    >
                      Ver detalle
                    </Button>
                    {delivered && submittedRating ? (
                      <p className="flex items-center gap-1 text-sm font-semibold text-eco-dark">
                        <Star aria-hidden="true" className="h-4 w-4 fill-current text-eco-terracotta" />
                        Gracias por calificar con {submittedRating} de 5.
                      </p>
                    ) : delivered ? (
                      <Button type="button" onClick={() => openRatingModal(order)}>
                        Calificar pedido
                      </Button>
                    ) : isDispatched ? (
                      <>
                        <Button
                          type="button"
                          disabled={confirmingOrderId !== null}
                          onClick={() => confirmReceived(order)}
                        >
                          {confirmingOrderId === order.id
                            ? "Confirmando recepción..."
                            : "Confirmar recepción"}
                        </Button>
                        <Button
                          type="button"
                          variant="light"
                          disabled={confirmingOrderId !== null}
                          onClick={() => {
                            setActionError(null);
                            setPendingAction({ type: "notReceived", order });
                          }}
                        >
                          No recibí mi pedido
                        </Button>
                      </>
                    ) : canCancel(order) ? (
                      <Button
                        type="button"
                        variant="light"
                        disabled={confirmingOrderId !== null}
                        onClick={() => {
                          setActionError(null);
                          setPendingAction({ type: "cancel", order });
                        }}
                      >
                        Cancelar pedido
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={detailOrderId !== null}
        onClose={closeDetailsModal}
        title="Detalle del pedido"
      >
        {detailsLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader label="Cargando detalle del pedido" />
          </div>
        ) : detailsError ? (
          <div className="space-y-4">
            <GlobalAlert message={detailsError} />
            <Button
              type="button"
              onClick={() => {
                setDetailsError(null);
                setOrderDetails(null);
                setDetailsRetryCount((count) => count + 1);
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : orderDetails ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-eco-background p-4">
              <p className="font-semibold text-eco-dark">
                {orderDetails.restaurant}
              </p>
              <p className="mt-1 text-sm text-eco-text-secondary">
                Pedido #{orderDetails.id} · {getStatusLabel(orderDetails.paymentMethod)}
              </p>
            </div>
            {orderDetails.items.length > 0 ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-eco-dark">
                  Productos del pedido
                </h3>
                <ul className="divide-y divide-eco-border">
                  {orderDetails.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-semibold text-eco-dark">
                          {item.quantity} × {item.product}
                        </p>
                        <p className="mt-1 text-xs text-eco-text-secondary">
                          {currencyFormatter.format(item.unitPrice)} cada uno
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-eco-dark">
                        {currencyFormatter.format(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-eco-text-secondary">
                Este pedido no tiene productos en el detalle.
              </p>
            )}
            <div className="space-y-2 border-t border-eco-border pt-3 text-sm">
              <div className="flex justify-between gap-3 text-eco-text-secondary">
                <span>Envío</span>
                <span>{currencyFormatter.format(orderDetails.deliveryCost)}</span>
              </div>
              <div className="flex justify-between gap-3 font-bold text-eco-dark">
                <span>Total</span>
                <span>{currencyFormatter.format(orderDetails.total)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={selectedOrder !== null}
        onClose={closeRatingModal}
        title="Calificá tu pedido"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="rounded-xl bg-eco-background p-4">
              <p className="font-semibold text-eco-dark">
                {selectedOrder.restaurant}
              </p>
              <p className="mt-1 text-sm text-eco-text-secondary">
                Pedido #{selectedOrder.id} ·{" "}
                {currencyFormatter.format(selectedOrder.total)}
              </p>
              <p className="mt-2 text-sm text-eco-text-secondary">
                ¿Cómo fue tu experiencia? Tu opinión ayuda a otras personas a
                elegir.
              </p>
            </div>

            <div
              aria-label="Elegí una calificación de 1 a 5 estrellas"
              className="flex justify-center gap-2"
              role="group"
            >
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  aria-label={`${stars} ${stars === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={rating === stars}
                  disabled={isSubmitting}
                  onClick={() => {
                    setRating(stars);
                    setRatingError(null);
                  }}
                  className="rounded-md p-1 text-eco-terracotta transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-dark disabled:cursor-not-allowed"
                >
                  <Star
                    aria-hidden="true"
                    className={`h-9 w-9 ${
                      rating >= stars ? "fill-current" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-eco-text-secondary">
              {rating === 0
                ? "Seleccioná de 1 a 5 estrellas"
                : `Elegiste ${rating} ${rating === 1 ? "estrella" : "estrellas"}`}
            </p>

            {ratingError && <GlobalAlert message={ratingError} />}

            <Button
              type="button"
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={rating === 0 || isSubmitting}
              onClick={submitRating}
            >
              {isSubmitting ? "Enviando..." : "Enviar calificación"}
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={pendingAction !== null}
        onClose={() => {
          if (confirmingOrderId === null) setPendingAction(null);
        }}
        title={
          pendingAction?.type === "cancel"
            ? "¿Cancelar pedido?"
            : "¿Informar que no lo recibiste?"
        }
      >
        {pendingAction && (
          <div className="space-y-4">
            <div className="rounded-xl bg-eco-background p-4">
              <p className="font-semibold text-eco-dark">
                {pendingAction.order.restaurant}
              </p>
              <p className="mt-1 text-sm text-eco-text-secondary">
                Pedido #{pendingAction.order.id}
              </p>
              <p className="mt-2 text-sm text-eco-text-secondary">
                {pendingAction.type === "cancel"
                  ? "Solo se pueden cancelar pedidos pendientes o en preparación. El estado de cancelación dependerá del tiempo desde su aceptación."
                  : "El pedido quedará marcado como no entregado. No se registrará la hora de entrega."}
              </p>
            </div>
            {actionError && <GlobalAlert message={actionError} />}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                disabled={confirmingOrderId !== null}
                onClick={submitOrderAction}
                className="flex-1"
              >
                {confirmingOrderId === pendingAction.order.id
                  ? "Procesando..."
                  : pendingAction.type === "cancel"
                    ? "Sí, cancelar pedido"
                    : "Sí, no lo recibí"}
              </Button>
              <Button
                type="button"
                variant="light"
                disabled={confirmingOrderId !== null}
                onClick={() => setPendingAction(null)}
                className="flex-1"
              >
                Volver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
