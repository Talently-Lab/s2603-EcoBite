import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function EmptyCart() {
  return (
    <EmptyState
      statusLabel="0 productos en el carrito"
      title="Tu carrito está vacío"
      description="Agrega platos de tus locales favoritos para empezar a medir tu impacto."
      largeIndicator
      indicatorClassName="text-3xl"
      descriptionClassName="w-full !max-w-none"
    >
      <Button
        to="/restaurantes"
        variant="dark"
        className="mx-auto mt-6 flex w-fit justify-center hover:bg-eco-dark/90"
      >
        Explorar locales
      </Button>
    </EmptyState>
  );
}
