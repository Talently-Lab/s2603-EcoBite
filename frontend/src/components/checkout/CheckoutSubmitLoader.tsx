import {  LoaderCircle } from "lucide-react";

export function CheckoutSubmitLoader() {
  return (
     <span role="status" className="inline-flex items-center justify-center gap-2">
      {/* 🌙 La luna/arco circular que gira de forma fluida */}
      <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin flex-shrink-0" />
      <span>Procesando tu pedido...</span>
    </span>
  );
}
