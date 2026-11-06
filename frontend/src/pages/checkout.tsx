import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../components/detailRestaurant/OrderSummary";
import { DeliveryAddressSection } from "../components/checkout/direction";
import { PaymentMethodSection } from "../components/checkout/method-page";
import { CheckoutOrderSummary } from "../components/checkout/CheckoutOrderSummary";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { HeroTitle } from "../components/ui/HeroTitle";
import { CheckoutConfirmationModal } from "../components/checkout/CheckoutConfirmationModal";
import { useCart } from "../contexts/CartContext";

interface CheckoutPageProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

export function CheckoutPage({ items, savedCo2Kg }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { createOrders } = useCart();
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmedCo2Saved, setConfirmedCo2Saved] = useState<number | null>(
    null,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setShowValidationErrors(true);

    if (items.length === 0) {
      setValidationMessage("Tu carrito está vacío. Agregá productos antes de confirmar.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const street = formData.get("street")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const zone = Number(formData.get("zone"));
    const paymentMethod = formData.get("paymentMethod")?.toString();

    if (!street || !city || !zone) {
      setValidationMessage(
        "Completá la dirección, la ciudad y la zona para confirmar el pedido.",
      );
      return;
    }

    setValidationMessage(null);
    setIsLoading(true);
    setPurchasedItems(items);
    void createOrders({
      id_zona: zone,
      tipo_pago: paymentMethod === "cash" ? "efectivo" : "tarjeta",
      direccion_entrega: `${street}, ${city}`,
      piso_entrega: formData.get("apartment")?.toString().trim() || undefined,
      indicacion_entrega: formData.get("instructions")?.toString().trim() || undefined,
    }).then((co2Saved) => {
      setConfirmedCo2Saved(co2Saved);
      setIsLoading(false);
      setIsConfirmationOpen(true);
    }).catch((error: unknown) => {
      setIsLoading(false);
      setValidationMessage(error instanceof Error ? error.message : "No se pudo confirmar el pedido.");
    });
  }

  function goToConfirmation() {
    setIsConfirmationOpen(false);
    navigate("/confirmacion", {
      state: { items: purchasedItems, savedCo2Kg: confirmedCo2Saved },
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <HeroTitle>Checkout</HeroTitle>
      {/* <HeroDescription>
        Completá los datos para preparar tu pedido
      </HeroDescription> */}
      {validationMessage && (
        <GlobalAlert
          className="mt-4 w-full"
          variant="error"
          message={validationMessage}
        />
      )}
      <form className="mt-8" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <DeliveryAddressSection
              showValidationErrors={showValidationErrors}
            />
            <PaymentMethodSection />
          </div>
          <CheckoutOrderSummary
            items={items}
            savedCo2Kg={savedCo2Kg}
            isLoading={isLoading}
          />
        </div>
      </form>
      <CheckoutConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={goToConfirmation}
        onViewOrder={goToConfirmation}
      />
    </main>
  );
}
