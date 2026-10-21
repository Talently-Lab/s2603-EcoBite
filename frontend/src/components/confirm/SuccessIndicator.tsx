import EmptyState from "../ui/EmptyState";
import { CheckIcon } from "../ui/CheckIcon";

export function SuccessIndicator() {
  return (
    <div className="mb-8">
      <EmptyState
        statusLabel="Pedido confirmado"
        indicator={<CheckIcon className="h-10 w-10 text-eco-dark" />}
        largeIndicator
        title="¡Pedido confirmado!"
        description="Gracias por elegir una entrega más sustentable."
      />
    </div>
  );
}
