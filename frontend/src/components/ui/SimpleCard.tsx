import React from 'react';

interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function SimpleCard({ children, className = '' }: SimpleCardProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}