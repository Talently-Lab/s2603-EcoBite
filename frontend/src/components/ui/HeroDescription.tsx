import React from 'react';

interface HeroDescriptionProps {
  children: React.ReactNode;
  className?: string; // Por si necesitas agregarle clases extras desde afuera
}

export function HeroDescription({ children, className = '' }: HeroDescriptionProps) {
  return (
    <p 
      className={`text-base md:text-lg text-gray-600 font-medium max-w-md leading-relaxed m-0 ${className}`}
    >
      {children}
    </p>
  );
}