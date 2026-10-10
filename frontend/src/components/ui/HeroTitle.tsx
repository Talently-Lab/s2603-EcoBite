import React from 'react';

interface HeroTitleProps {
  children: React.ReactNode;
  className?: string; // Por si necesitas agregarle clases extras desde afuera
}

export function HeroTitle({ children, className = '' }: HeroTitleProps) {
  return (
    <h1 
      className={`text-3xl md:text-4xl font-extrabold text-eco-dark tracking-tight leading-tight m-0 ${className}`}
    >
      {children}
    </h1>
  );
}

export default HeroTitle;