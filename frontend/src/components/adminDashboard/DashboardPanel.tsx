import type { ReactNode } from "react";

interface DashboardPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DashboardPanel({
  title,
  children,
  className = "",
}: DashboardPanelProps) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-eco-dark">{title}</h2>
      {children}
    </section>
  );
}
