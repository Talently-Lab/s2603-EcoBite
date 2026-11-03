import { CircleAlert } from "lucide-react";
import Button from "../ui/Button";

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <section
      role="alert"
      className="mt-8 flex flex-col gap-4 rounded-xl border border-red-400 bg-red-50 px-5 py-4 text-red-700 sm:flex-row sm:items-center"
    >
      <CircleAlert
        aria-hidden="true"
        className="hidden h-8 w-8 shrink-0 rounded-full bg-white p-2 sm:block"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">No pudimos cargar tus números</h2>
        <p className="mt-1 text-xs leading-snug text-gray-800 sm:text-sm">
          Tus pedidos y tus datos están a salvo. Revisá tu conexión y probá de
          nuevo; si el problema sigue, escribinos a soporte@ecobite.com.
        </p>
        <p className="mt-1 text-xs text-red-700">{message}</p>
      </div>
      <Button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-lg px-4"
      >
        Reintentar
      </Button>
    </section>
  );
}
