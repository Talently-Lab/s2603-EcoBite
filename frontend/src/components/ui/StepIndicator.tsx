import React from 'react';

interface StepIndicatorProps {
  number: number;
  className?: string;
}

export default function StepIndicator({ number, className = '' }: StepIndicatorProps) {
  return (
    <div 
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-eco-dark text-white ${className}`}
    >
      {number}
    </div>
  );
}