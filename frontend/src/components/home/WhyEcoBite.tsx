import React from 'react';
import SimpleCard from '@/components/ui/SimpleCard';
import Badge from '@/components/ui/Badge';
import { Leaf, Zap, Cloud } from 'lucide-react'; // Cambié Lightning por Zap que es el estándar de lucide

interface BenefitItem {
  id: number;
  badgeText: string;
  badgeClass: string;
  icon: React.ReactNode;
  description: string;
}

const BENEFICIOS: BenefitItem[] = [
  {
    id: 1,
    badgeText: 'Envases biodegradables',
    badgeClass: 'bg-[#EAF5E9] text-[#2E6F40]', // Colores más suaves y estéticos
    icon: <Leaf className="w-3.5 h-3.5" />,
    description: 'Cada local usa packaging 100 % compostable.',
  },
  {
    id: 2,
    badgeText: 'Transporte sin emisiones',
    badgeClass: 'bg-[#E3F2FD] text-[#1E6B9E]',
    icon: <Zap className="w-3.5 h-3.5" />,
    description: 'Bicicletas y vehículos eléctricos.',
  },
  {
    id: 3,
    badgeText: 'Medí tu impacto',
    badgeClass: 'bg-[#E1F5FE] text-[#0277BD]',
    icon: <Cloud className="w-3.5 h-3.5" />,
    description: 'Sabé cuánto CO₂ ahorrás con cada pedido.',
  },
];

export default function WhyEcoBite() {
  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Título de la sección */}
      <h2 className="text-3xl font-bold text-eco-dark mb-8">
        Por qué EcoBite
      </h2>

      {/* Contenedor Responsivo: 1 columna en celular, 3 columnas en escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFICIOS.map((item) => (
          <SimpleCard key={item.id} className="flex flex-col gap-4 items-start h-full">
            {/* Renderizamos el Badge dinámico */}
            <Badge 
              icon={item.icon} 
              text={item.badgeText} 
              className={item.badgeClass} 
            />
            
            {/* Párrafo descriptivo */}
            <p className="text-gray-600 font-medium text-base leading-relaxed">
              {item.description}
            </p>
          </SimpleCard>
        ))}
      </div>
    </section>
  );
}