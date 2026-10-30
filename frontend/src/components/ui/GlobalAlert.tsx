import { CircleAlert, Info } from "lucide-react";

interface GlobalAlertProps {
  message: string;
  variant?: "error" | "info";
  className?: string;
}

const variantStyles = {
  error: {
    container: "border-red-400 bg-red-50 text-red-700",
    icon: CircleAlert,
    role: "alert",
  },
  info: {
    container: "border-amber-300 bg-amber-100 text-amber-700",
    icon: Info,
    role: "status",
  },
} as const;

export function GlobalAlert({
  message,
  variant = "error",
  className = "w-full",
}: GlobalAlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      role={styles.role}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 font-sans text-xs sm:text-sm ${className} ${styles.container}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="leading-snug">{message}</span>
    </div>
  );
}
