import React from 'react';

interface InitialBannerProps {
  letter: string;
}

export function InitialBanner({ letter }: InitialBannerProps) {
  return (

    <div 
      className="h-28 w-full bg-[linear-gradient(to_right,var(--color-eco-light)_0%,transparent_100%)] px-5 pb-1 flex items-end justify-start text-5xl font-extrabold text-eco-dark select-none"
    >
      
      {letter}
    </div>
  );
}