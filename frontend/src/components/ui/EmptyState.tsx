import type { ReactNode } from "react";
import HeroTitle from "./HeroTitle";
import { HeroDescription } from "./HeroDescription";

interface EmptyStateProps {
  statusLabel: string;
  title: string;
  description: string;
  indicator?: ReactNode;
  largeIndicator?: boolean;
  indicatorClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
}

export default function EmptyState({
  statusLabel,
  title,
  description,
  indicator = "0",
  largeIndicator = false,
  indicatorClassName = "",
  descriptionClassName = "",
  children,
}: EmptyStateProps) {
  return (
    <div className="mx-auto mt-6 text-center">
      <span
        role="status"
        aria-label={statusLabel}
        className={`mb-6 inline-flex items-center justify-center rounded-full border-2 border-eco-dark bg-eco-light/50 font-bold text-eco-dark ${
          largeIndicator ? "h-16 w-16" : "h-12 w-12 text-lg"
        } ${indicatorClassName}`}
      >
        {indicator}
      </span>
      <section className="mx-auto max-w-2xl">
        <HeroTitle>{title}</HeroTitle>
        <HeroDescription className={`mx-auto mt-5 ${descriptionClassName}`}>
          {description}
        </HeroDescription>
        {children}
      </section>
    </div>
  );
}
