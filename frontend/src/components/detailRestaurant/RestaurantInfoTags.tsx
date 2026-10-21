import { Leaf, Zap, Cloud } from "lucide-react";
import Badge from '../ui/Badge';

// Centralizamos las configuraciones de los 3 tipos de la imagen
const LABEL_CONFIG: Record<string, { className: string; icon: React.ReactNode; text: string }> = {
  "sin-emisiones": {
    text: "Transporte sin emisiones",
    className: "bg-[#E5F2F1] text-[#245856] ",
    icon: <Zap className="h-3.5 w-3.5" />
  },
  "ahorro-co2": {
    text: "Ahorra ~300 g CO₂ por pedido",
    className: "bg-[#E6F0F5] text-[#255261]",
    icon: <Cloud className="h-3.5 w-3.5" />
  }
};

interface RestaurantInfoTagsProps {
  labels?: string[]; // Recibe ['biodegradable', 'sin-emisiones', 'ahorro-co2']
}

export function RestaurantInfoTags({ labels = [] }: RestaurantInfoTagsProps) {
  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap">
      {labels.map((labelKey) => {
        const normalizedLabel = labelKey.toLowerCase();
        if (
          normalizedLabel === "biodegradable" ||
          normalizedLabel === "envase biodegradable"
        ) {
          return (
            <Badge
              key={labelKey}
              text="Envase 100 % biodegradable"
              className="bg-eco-light text-eco-dark"
              icon={<Leaf className="h-3.5 w-3.5" />}
            />
          );
        }

        // Buscamos la configuración que coincida en el diccionario
        const config = LABEL_CONFIG[normalizedLabel];
        if (!config) return null;

        return (
          <Badge
            key={labelKey}
            text={config.text}
            className={`${config.className} px-2.5 py-1`}
            icon={config.icon}
          />
        );
      })}
    </div>
  );
}
