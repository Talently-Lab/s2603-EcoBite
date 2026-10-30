interface RestaurantStatusBadgeProps {
  isOpen: boolean | null;
}

const STATUS_CONFIG = {
  open: { 
    label: 'Abierto ahora', 
    showDot: true, 
    badgeClass: 'bg-eco-light text-eco-dark shadow-sm px-2.5 py-1', // Estilo con fondo para el abierto
    dotColor: 'bg-green-500' 
  },
  closed: { 
    label: 'Cerrado ahora', 
    showDot: false, // Sin punto en tu diseño
    badgeClass: 'bg-[#4A5A55] text-white shadow-sm px-2.5 py-1',
    dotColor: '' 
  },
  unknown: { 
    label: 'Estado no disponible', 
    showDot: false, 
    badgeClass: 'text-gray-400 text-xs px-1 py-1', 
    dotColor: '' 
  },
};

export function RestaurantStatusBadge({ isOpen }: RestaurantStatusBadgeProps) {
  const statusKey = isOpen === true ? 'open' : isOpen === false ? 'closed' : 'unknown';
  const { label, showDot, badgeClass, dotColor } = STATUS_CONFIG[statusKey];

  return (
    <div 
      role="status" 
      aria-label={`Estado del restaurante: ${label}`}
      className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full font-semibold text-xs ${badgeClass}`}
    >
      {showDot && (
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotColor}`} />
      )}
      <span>{label}</span>
    </div>
  );
}
