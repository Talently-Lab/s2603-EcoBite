import { useCallback } from "react";
import type { ComponentType } from "react";
import CountUpImport, { type CountUpProps } from "react-countup";

function isCountUpComponent(
  value: unknown,
): value is ComponentType<CountUpProps> {
  return typeof value === "function";
}

function hasDefaultCountUpComponent(
  value: unknown,
): value is { default: ComponentType<CountUpProps> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "default" in value &&
    typeof value.default === "function"
  );
}

function resolveCountUpComponent(
  value: unknown,
): ComponentType<CountUpProps> {
  if (isCountUpComponent(value)) return value;
  if (hasDefaultCountUpComponent(value)) return value.default;
  throw new Error("No se pudo cargar el contador animado.");
}

const CountUp = resolveCountUpComponent(CountUpImport);

interface AnimatedNumberProps {
  value: number | string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = minimumFractionDigits,
  suffix = "",
}: AnimatedNumberProps) {
  const formatValue = useCallback(
    (animatedValue: number) =>
      `${animatedValue.toLocaleString("es-AR", {
        minimumFractionDigits,
        maximumFractionDigits,
      })}${suffix}`,
    [maximumFractionDigits, minimumFractionDigits, suffix],
  );

  return (
    <CountUp
      start={0}
      end={Number(value)}
      duration={1}
      decimals={maximumFractionDigits}
      formattingFn={formatValue}
    />
  );
}
