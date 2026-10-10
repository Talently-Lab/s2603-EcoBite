import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Cargando", className = "" }: LoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center ${className}`}
    >
      <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
    </span>
  );
}
