import Button from '@/components/ui/Button';

export default function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-7xl items-center px-6 pb-10 pt-8 md:pt-14">
      {/* Grid responsivo: 1 columna en móvil, 2 columnas que se igualan en altura en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full">
        
        {/* LADO IZQUIERDO: Textos y Botones */}
        <div className="flex flex-col justify-center gap-6">
          
          {/* Título y Subtítulo originales */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#042A25] tracking-tight leading-tight">
              Nos importa lo que elegís comer y cómo cuidamos el planeta.
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-medium max-w-md leading-relaxed">
              Elegí diferente. Elegí consciente. <br />
              Disfrutá tu comida mientras reducís el impacto de tu pedido.
            </p>
          </div>

          <div className="flex w-fit flex-col gap-3 sm:flex-row">
            <Button
              to="/restaurantes"
              variant="dark"
              className="inline-flex justify-center whitespace-nowrap hover:bg-eco-dark/90"
            >
              Explorar locales
            </Button>
            <Button
              to="/#como-funciona"
              variant="light"
              className="inline-flex justify-center whitespace-nowrap bg-white hover:bg-gray-50"
            >
              Cómo funciona
            </Button>
          </div>

        </div>

        {/* LADO DERECHO: Contenedor e Imagen integrados aquí mismo */}
        <div className="relative min-h-68 w-full overflow-hidden rounded-2xl shadow-sm md:min-h-112">
          <img 
            src="/images/hero-cover.jpg" // Cambiá esto por la ruta de tu imagen real
            alt="Plato en envase biodegradable" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}