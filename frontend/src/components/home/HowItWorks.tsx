import StepIndicator from "@/components/ui/StepIndicator"; // Asegurate de que la ruta sea correcta

interface Step {
  id: number;
  text: string;
}

const PASOS_COMO_FUNCIONA: Step[] = [
  { id: 1, text: "Elegí tu local" },
  { id: 2, text: "Pedí" },
  { id: 3, text: "Recibí y mirá tu impacto" },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="p-6 max-w-5xl mx-auto rounded-lg">
      {/* Título de la sección */}
      <h2 className="text-2xl font-bold text-eco-dark mb-6">Cómo funciona</h2>

      {/* Lista de pasos: Vertical en móvil, Horizontal en desktop */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 md:gap-8">
        {PASOS_COMO_FUNCIONA.map((paso) => (
          <div key={paso.id} className="flex items-center gap-4 flex-1">
            {/* Tu átomo redondo con el número centrado */}
            <StepIndicator number={paso.id} />

            {/* Texto de cada paso */}
            <p className="text-lg font-bold text-eco-dark whitespace-nowrap">{paso.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
