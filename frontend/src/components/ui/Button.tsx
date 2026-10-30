import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "light" | "dark";
  to?: string;
  onLinkClick?: LinkProps["onClick"];
}

export default function Button({
  variant = "dark",
  className = "",
  to,
  onLinkClick,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    light: "border border-eco-dark border-2 text-eco-dark",
    dark: "bg-eco-dark text-white border-2 border-eco-dark",
  };

  const styles = `rounded-md px-3.5 py-2 text-sm font-bold ${variantStyles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} onClick={onLinkClick} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={styles}>
      {children}
    </button>
  );
}