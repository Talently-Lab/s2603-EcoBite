import { OpeningDayCard } from "./OpeningDayCard";
import type { OpeningDay } from "./types";

interface OpeningDayListProps {
  days: OpeningDay[];
  onToggleDay: (dayId: string) => void;
  onAddShift: (dayId: string) => void;
  onRemoveShift: (dayId: string, shiftId: string) => void;
  onUpdateShift: (
    dayId: string,
    shiftId: string,
    field: "start" | "end",
    value: string,
  ) => void;
}

export function OpeningDayList({
  days,
  onToggleDay,
  onAddShift,
  onRemoveShift,
  onUpdateShift,
}: OpeningDayListProps) {
  return (
    <div className="flex flex-col gap-2" aria-label="Días de atención">
      {days.map((day) => (
        <OpeningDayCard
          key={day.id}
          day={day}
          onToggle={() => onToggleDay(day.id)}
          onAddShift={() => onAddShift(day.id)}
          onRemoveShift={(shiftId) => onRemoveShift(day.id, shiftId)}
          onUpdateShift={(shiftId, field, value) =>
            onUpdateShift(day.id, shiftId, field, value)
          }
        />
      ))}
    </div>
  );
}
