import { AnimatedNumber } from "../ui/AnimatedNumber";

export function AnimatedCo2Value({ value }: { value: number | string }) {
  return (
    <AnimatedNumber
      value={value}
      minimumFractionDigits={3}
      maximumFractionDigits={3}
      suffix=" kg"
    />
  );
}
