import Button from "@/components/ui/Button";
import { HeroTitle } from "../ui/HeroTitle";

export default function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-7xl items-center px-6 pb-10 pt-8 md:pt-14">
      {/* Grid responsivo: 1 columna en móvil, 2 columnas que se igualan en altura en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full">
        {/* LADO IZQUIERDO: Textos y Botones */}
        <div className="flex flex-col justify-center gap-6">
          {/* Título y Subtítulo originales */}
          <div className="space-y-4">
            <HeroTitle>Nos importa lo que elegís comer y cómo cuidamos el planeta.</HeroTitle>
            <p className="text-base md:text-lg text-gray-600 font-medium max-w-md leading-relaxed">
              Elegí diferente. Elegí consciente. <br />
              Disfrutá tu comida mientras reducís el impacto de tu pedido.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-fit sm:flex-row">
            <Button
              to="/restaurantes"
              variant="dark"
              className="inline-flex w-full justify-center whitespace-nowrap hover:bg-eco-dark/90 sm:w-auto"
            >
              Explorar locales
            </Button>
            <Button
              to="/#como-funciona"
              variant="light"
              className="inline-flex w-full justify-center whitespace-nowrap bg-white hover:bg-gray-50 sm:w-auto"
            >
              Cómo funciona
            </Button>
          </div>
        </div>

        {/* Placeholder hasta contar con la imagen principal */}
        <div className="min-h-68 w-full rounded-2xl bg-eco-light shadow-sm md:min-h-112" />
      </div>
    </section>
  );
}
