import { OpeningDayList } from "./OpeningDayList";
import type { OpeningDay } from "./types";

const weekDays = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

export function createInitialOpeningDays(): OpeningDay[] {
  return weekDays.map(({ id, label }) => ({
    id,
    label,
    isOpen: false,
    shifts: [],
  }));
}

function createShift(): OpeningDay["shifts"][number] {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    start: "09:00",
    end: "18:00",
  };
}

interface RestaurantOpeningHoursProps {
  days: OpeningDay[];
  onChange: (days: OpeningDay[]) => void;
}

export function RestaurantOpeningHours({
  days,
  onChange,
}: RestaurantOpeningHoursProps) {

  function updateDay(dayId: string, update: (day: OpeningDay) => OpeningDay) {
    onChange(
      days.map((day) => (day.id === dayId ? update(day) : day)),
    );
  }

  function toggleDay(dayId: string) {
    updateDay(dayId, (day) => {
      const isOpen = !day.isOpen;
      return {
        ...day,
        isOpen,
        shifts: isOpen && day.shifts.length === 0 ? [createShift()] : day.shifts,
      };
    });
  }

  function addShift(dayId: string) {
    updateDay(dayId, (day) =>
      day.shifts.length >= 2
        ? day
        : { ...day, shifts: [...day.shifts, createShift()] },
    );
  }

  function removeShift(dayId: string, shiftId: string) {
    updateDay(dayId, (day) => ({
      ...day,
      shifts: day.shifts.filter((shift) => shift.id !== shiftId),
    }));
  }

  function updateShift(
    dayId: string,
    shiftId: string,
    field: "start" | "end",
    value: string,
  ) {
    updateDay(dayId, (day) => ({
      ...day,
      shifts: day.shifts.map((shift) =>
        shift.id === shiftId ? { ...shift, [field]: value } : shift,
      ),
    }));
  }

  return (
    <OpeningDayList
      days={days}
      onToggleDay={toggleDay}
      onAddShift={addShift}
      onRemoveShift={removeShift}
      onUpdateShift={updateShift}
    />
  );
}
