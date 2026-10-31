import type { OpeningDay, ScheduleShift } from "./types";

interface OpeningDayCardProps {
  day: OpeningDay;
  onToggle: () => void;
  onAddShift: () => void;
  onRemoveShift: (shiftId: string) => void;
  onUpdateShift: (shiftId: string, field: "start" | "end", value: string) => void;
}

function ShiftRow({
  shift,
  onRemove,
  onUpdate,
}: {
  shift: ScheduleShift;
  onRemove: () => void;
  onUpdate: (field: "start" | "end", value: string) => void;
}) {
  const hasTimeOrderError = shift.end <= shift.start;
  const timeFieldClassName =
    `h-8 min-w-0 appearance-none bg-transparent text-center text-xs outline-none focus:bg-eco-background ${hasTimeOrderError ? "text-red-700" : "text-gray-800"}`;

  function renderTimeField(field: "start" | "end", label: string) {
    const [hour = "09", minute = "00"] = shift[field].split(":");
    const setPart = (part: "hour" | "minute", value: string) => {
      onUpdate(
        field,
        part === "hour" ? `${value}:${minute}` : `${hour}:${value}`,
      );
    };

    return (
      <div
        className={`flex h-8 w-[4.25rem] items-center justify-center rounded-md border px-0.5 sm:w-20 ${hasTimeOrderError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white focus-within:border-eco-dark"}`}
        role="group"
        aria-label={label}
      >
        <label className="sr-only" htmlFor={`${shift.id}-${field}-hour`}>
          Hora
        </label>
        <select
          id={`${shift.id}-${field}-hour`}
          value={hour}
          onChange={(event) => setPart("hour", event.currentTarget.value)}
          className={`${timeFieldClassName} w-8`}
        >
          {Array.from({ length: 24 }, (_, index) => {
            const value = String(index).padStart(2, "0");
            return <option key={value} value={value}>{value}</option>;
          })}
        </select>
        <span aria-hidden="true" className="text-xs text-gray-600">:</span>
        <label className="sr-only" htmlFor={`${shift.id}-${field}-minute`}>
          Minutos
        </label>
        <select
          id={`${shift.id}-${field}-minute`}
          value={minute}
          onChange={(event) => setPart("minute", event.currentTarget.value)}
          className={`${timeFieldClassName} w-8`}
        >
          {Array.from({ length: 60 }, (_, index) => {
            const value = String(index).padStart(2, "0");
            return <option key={value} value={value}>{value}</option>;
          })}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <span aria-hidden="true">De</span>
        {renderTimeField("start", "Horario desde")}
        <span aria-hidden="true">a</span>
        {renderTimeField("end", "Horario hasta")}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar turno"
          className="ml-0.5 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
        >
          ×
        </button>
      </div>
      {hasTimeOrderError && (
        <p className="mb-0 mt-1 flex items-center gap-1 text-[10px] text-red-600" role="alert">
          <span aria-hidden="true">✕</span>
          El cierre tiene que ser posterior a la apertura.
        </p>
      )}
    </div>
  );
}

export function OpeningDayCard({
  day,
  onToggle,
  onAddShift,
  onRemoveShift,
  onUpdateShift,
}: OpeningDayCardProps) {
  const hasInvalidShift =
    day.isOpen && day.shifts.some((shift) => shift.end <= shift.start);

  return (
    <article className={`grid grid-cols-[minmax(7rem,1fr)_minmax(0,2fr)] gap-3 rounded-xl border p-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5 sm:px-4 ${hasInvalidShift ? "border-red-500 bg-red-50" : "border-gray-200 bg-[#f7f8f3]"}`}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={day.isOpen}
          aria-label={`${day.isOpen ? "Cerrar" : "Abrir"} ${day.label.toLowerCase()}`}
          onClick={onToggle}
          className={`relative mt-0.5 h-4 w-7 shrink-0 rounded-full transition-colors ${day.isOpen ? "bg-eco-dark" : "bg-gray-300"}`}
        >
          <span
            className={`absolute left-0 top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${day.isOpen ? "translate-x-3.5" : "translate-x-0.5"}`}
          />
        </button>
        <div>
          <p className="m-0 text-xs font-semibold text-gray-800">{day.label}</p>
          <p className="m-0 text-[10px] text-gray-500">
            {day.isOpen ? "Abierto" : "Cerrado"}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-1.5">
        {day.isOpen ? (
          <>
            {day.shifts.map((shift) => (
              <ShiftRow
                key={shift.id}
                shift={shift}
                onRemove={() => onRemoveShift(shift.id)}
                onUpdate={(field, value) => onUpdateShift(shift.id, field, value)}
              />
            ))}
            {day.shifts.length < 2 && (
              <button
                type="button"
                onClick={onAddShift}
                className="ml-0.5 text-[10px] font-semibold text-eco-dark hover:underline"
              >
                + Agregar turno
              </button>
            )}
          </>
        ) : (
          <p className="m-0 py-1 text-[10px] text-gray-500">No abre este día</p>
        )}
      </div>
    </article>
  );
}
