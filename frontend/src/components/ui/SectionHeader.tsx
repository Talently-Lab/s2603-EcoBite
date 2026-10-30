import { Title } from "../ui/Title";
import { Arrow } from "../ui/ArrowButton";

interface SectionHeaderProps {
  titleText: string;
  viewAllHref?: string;
}

export function SectionHeader({ titleText, viewAllHref }: SectionHeaderProps) {
  return (
    // item-baseline asegura que "Ver todos" se alinee perfectamente con la base del título
    <div className="flex justify-between items-baseline mb-6 w-full md:mb-8">
      {/* Título a la izquierda de forma fluida */}
      <div className="w-auto">
        <Title>{titleText}</Title>
      </div>
      
      {/* Enlace con flecha a la derecha */}
      {viewAllHref && (
        <a 
          href={viewAllHref} 
          className="text-sm font-bold text-eco-dark hover:underline flex items-center gap-1 shrink-0 md:text-base"
        >
          Ver todos <Arrow direction="right" />
        </a>
      )}
    </div>
  );
}