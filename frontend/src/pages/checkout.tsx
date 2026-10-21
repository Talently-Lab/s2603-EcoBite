import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../components/detailRestaurant/OrderSummary";
import { DeliveryAddressSection } from "../components/checkout/direction";
import { PaymentMethodSection } from "../components/checkout/method-page";
import { CheckoutOrderSummary } from "../components/checkout/CheckoutOrderSummary";
import { GlobalAlert } from "../components/ui/GlobalAlert";
import { HeroTitle } from "../components/ui/HeroTitle";
import { CheckoutConfirmationModal } from "../components/checkout/CheckoutConfirmationModal";

interface CheckoutPageProps {
  items: CartItem[];
  savedCo2Kg: number | null;
}

export function CheckoutPage({ items, savedCo2Kg }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const processingTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (processingTimeout.current !== null) {
      window.clearTimeout(processingTimeout.current);
    }
  }, []);

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

    if (!street || !city) {
      setValidationMessage(
        "Revisá los campos obligatorios antes de confirmar el pedido.",
      );
      return;
    }

    setValidationMessage(null);
    setIsLoading(true);
    processingTimeout.current = window.setTimeout(() => {
      setIsLoading(false);
      setIsConfirmationOpen(true);
      processingTimeout.current = null;
    }, 1000);
  }

  function goToConfirmation() {
    setIsConfirmationOpen(false);
    navigate("/confirmacion");
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
