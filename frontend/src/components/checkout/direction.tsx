import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/Input";
import { Title } from "../ui/Title";

interface DeliveryAddressSectionProps {
  showValidationErrors: boolean;
}

export function DeliveryAddressSection({
  showValidationErrors,
}: DeliveryAddressSectionProps) {
  const [form, setForm] = useState({
    street: "",
    apartment: "",
    city: "",
    instructions: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  return (
    <section
      aria-labelledby="delivery-address-title"
      className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-dark text-sm font-bold text-white"
        >
          1
        </span>
        <Title
          as="h2"
          id="delivery-address-title"
          className="text-lg font-bold opacity-100"
        >
          Dirección de entrega
        </Title>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Calle y número"
          name="street"
          autoComplete="street-address"
          placeholder="Ej.: Av. Corrientes 1234"
          value={form.street}
          onChange={handleChange}
          required
          error={showValidationErrors && !form.street.trim()}
          errorMessage="Ingresá la calle y el número."
        />
        <Input
          label="Piso / Depto"
          name="apartment"
          autoComplete="address-line2"
          placeholder="Opcional"
          value={form.apartment}
          onChange={handleChange}
        />
        <Input
          label="Ciudad"
          name="city"
          autoComplete="address-level2"
          placeholder="Ej.: Buenos Aires"
          value={form.city}
          onChange={handleChange}
          required
          error={showValidationErrors && !form.city.trim()}
          errorMessage="Ingresá una ciudad."
        />
        <Input
          label="Indicaciones para la entrega"
          name="instructions"
          placeholder="Ej.: timbre 3B"
          value={form.instructions}
          onChange={handleChange}
        />
      </div>
      <button
        type="button"
        className="mt-1 w-fit text-sm font-bold text-eco-dark underline underline-offset-2 transition-colors hover:text-eco-dark/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-dark"
      >
        Cambiar dirección guardada
      </button>
    </section>
  );
}
