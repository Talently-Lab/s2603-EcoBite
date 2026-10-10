
// Estructura de propiedades para el selector dinámico
interface DropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

export function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  return (
    <div className="relative w-full font-sans">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-gray-100 hover:bg-gray-200/70 text-gray-700 text-sm font-medium px-4 py-2.5 pr-10 rounded-full border-none cursor-pointer transition-colors outline-none"
      >
        {/* Opción base que actúa como el título del filtro cuando no hay selección */}
        <option value="">{label} ▾</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Flechita indicadora minimalista a la derecha para reemplazar la nativa */}
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}