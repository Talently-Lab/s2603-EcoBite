
interface ArrowProps {
  direction?: 'left' | 'right';
  className?: string;
}

export function Arrow({ direction = 'right', className = '' }: ArrowProps) {
  return (
    <span className={`inline-block select-none font-normal text-base transition-transform ${className}`}>
      {direction === 'right' ? '→' : '←'}
    </span>
  );
}