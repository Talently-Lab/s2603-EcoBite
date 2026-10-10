import { Title } from "../ui/Title";

interface ImpactCounterProps {
  titleText?: string;
  value: string | number;
  unit: string;
  footerText?: string;
}

export default function ImpactCounter({
  titleText,
  value,
  unit,
  footerText
}: ImpactCounterProps) {
  return (
    <section className="w-full bg-eco-light/50 font-sans">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-6 py-5 text-left md:grid-cols-2 md:items-center md:gap-8">
        <div>
          <Title>{titleText}</Title>
          <div className="mt-2 mb-1 flex items-baseline gap-1 text-2xl font-bold text-eco-dark">
            <span>{value}</span>
            <span className="text-xl font-bold">{unit}</span>
          </div>
        </div>

        {footerText && (
          <p className="m-0 text-md text-eco-dark md:text-right">
            {footerText}
          </p>
        )}
      </div>
    </section>
  );
}