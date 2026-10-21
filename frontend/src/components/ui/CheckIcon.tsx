interface CheckIconProps {
  className?: string;
}

export function CheckIcon({
  className = "h-7 w-7 text-[#134439]",
}: CheckIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 12.5l4.5 4.5c0 0 4.5-8.5 10.5-12.5" />
    </svg>
  );
}
