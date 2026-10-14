import type { ReactNode } from "react";
import { HeroDescription } from "./HeroDescription";
import HeroTitle from "./HeroTitle";

interface ErrorStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function ErrorState({ title, description, children }: ErrorStateProps) {
  return (
    <div role="alert" className="mx-auto mt-6 text-center">
      <span
        aria-hidden="true"
        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-700 bg-red-50 text-lg font-bold text-red-700"
      >
        !
      </span>
      <section className="mx-auto max-w-2xl">
        <HeroTitle>{title}</HeroTitle>
        <HeroDescription className="mx-auto mt-5">
          {description}
        </HeroDescription>
        {children}
      </section>
    </div>
  );
}
