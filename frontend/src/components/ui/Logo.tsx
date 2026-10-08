interface LogoProps {
  className?: string;
  ecoColor?: string;
  biteColor?: string;
}

export default function Logo({
  className = "",
  ecoColor = "text-eco-olive",
  biteColor = "text-eco-terracotta",
}: LogoProps) {
  return (
    <span className={`font-bold ${className}`}>
      <span className={ecoColor}>Eco</span>
      <span className={biteColor}>Bite</span>
    </span>
  );
}