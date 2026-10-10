import type { HTMLAttributes } from "react";

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
      className={`m-0 text-sm font-semibold text-eco-dark opacity-90 ${className}`}
    />
  );
}