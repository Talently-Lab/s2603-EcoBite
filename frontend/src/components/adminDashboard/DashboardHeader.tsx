import { HeroDescription } from "../ui/HeroDescription";
import { HeroTitle } from "../ui/HeroTitle";

interface DashboardHeaderProps {
  restaurantName?: string;
  month: string;
  loading: boolean;
  error: string | null;
  onMonthChange: (month: string) => void;
  description?: string;
}

export function DashboardHeader({
  restaurantName,
  month,
  loading,
  error,
  onMonthChange,
  description = "Así viene tu impacto y tus ventas. Los números se calculan con los pedidos del mes elegido.",
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold  text-gray-500">
          PANEL DEL RESTAURANTE
        </p>
        <HeroTitle className="mt-1 text-3xl! font-bold! tracking-normal!">
          {restaurantName ? `Hola, ${restaurantName}` : "Hola"}
        </HeroTitle>
        <HeroDescription className="mt-2 text-xs! max-w-none! tracking-wider!">
          {description}
        </HeroDescription>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="dashboard-month"
          className="text-sm font-semibold text-eco-dark"
        >
          Mes
        </label>
        <input
          id="dashboard-month"
          type="month"
          value={month}
          disabled={loading || error !== null}
          onChange={(event) => onMonthChange(event.currentTarget.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-700 shadow-sm focus:border-eco-dark focus:ring-1 focus:ring-eco-dark disabled:cursor-wait disabled:bg-gray-100 disabled:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:border-l [&::-webkit-calendar-picker-indicator]:border-gray-300 [&::-webkit-calendar-picker-indicator]:pl-2"
        />
      </div>
    </header>
  );
}
