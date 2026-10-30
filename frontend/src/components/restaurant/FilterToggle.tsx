interface FilterToggleProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function FilterToggle({ label, isActive, onClick }: FilterToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-sm font-medium px-5 py-2.5 rounded-full border border-transparent text-left cursor-pointer transition-all duration-200
        ${isActive 
          ? "bg-eco-dark text-white shadow-sm font-semibold" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200/70"
        }`}
    >
      {label}
    </button>
  );
}