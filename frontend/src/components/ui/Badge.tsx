import React from 'react';

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
  className?: string; // Para pasarle los diferentes colores de fondo y texto
}

export default function Badge({ icon, text, className = '' }: BadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}