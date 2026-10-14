import { CreditCard, Wallet } from "lucide-react";
import { GlobalAlert } from "../ui/GlobalAlert";
import { Title } from "../ui/Title";

const paymentMethods = [
  {
    id: "card",
    label: "Tarjeta de crédito o débito",
    detail: "Simulado · No se realizará ningún cobro",
    icon: CreditCard,
  },
  {
    id: "cash",
    label: "Efectivo",
    detail: "Simulado · Pago al recibir el pedido",
    icon: Wallet,
  },
];

export function PaymentMethodSection() {
  return (
    <section
      aria-labelledby="payment-method-title"
      className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-dark text-sm font-bold text-white"
        >
          2
        </span>
        <Title
          as="h2"
          id="payment-method-title"
          className="text-lg font-bold opacity-100"
        >
          Método de pago
        </Title>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Elegí un método de pago simulado</legend>
        {paymentMethods.map(({ id, label, detail, icon: Icon }) => (
          <label
            key={id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-eco-dark has-[:checked]:border-eco-dark has-[:checked]:bg-eco-light/20"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={id}
              defaultChecked={id === "card"}
              className="mt-1 accent-eco-dark"
            />
            <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 text-eco-dark" />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-eco-dark">
                {label}
              </span>
              <span className="text-xs text-gray-600">{detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <GlobalAlert
        variant="info"
        message="Pago simulado: no se realiza ningún cobro real."
      />
    </section>
  );
}
