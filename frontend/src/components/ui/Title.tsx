import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3";
}

export function Title({
  as: Heading = "h3",
  className = "",
  ...props
}: TitleProps) {
  return (
    <Heading
      {...props}
      className={twMerge(
        "m-0 text-sm font-semibold text-eco-dark opacity-90",
        className,
      )}
    />
  );
}