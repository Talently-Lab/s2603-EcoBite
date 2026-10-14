import { Check } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export function SuccessIndicator() {
  return (
    <div className="mb-8">
      <EmptyState
        statusLabel="Pedido confirmado"
        indicator={<Check aria-hidden="true" className="h-10 w-10" />}
        largeIndicator
        title="¡Pedido confirmado!"
        description="Gracias por elegir una entrega más sustentable."
      />
    </div>
  );
}