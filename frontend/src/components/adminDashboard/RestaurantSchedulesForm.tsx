import { useEffect, useState } from "react";
import { GlobalAlert } from "../ui/GlobalAlert";
import {
  createInitialOpeningDays,
  RestaurantOpeningHours,
} from "../login/schedules/RestaurantOpeningHours";
import type { OpeningDay } from "../login/schedules/types";
import {
  getRestaurantSchedules,
  saveRestaurantSchedules,
  type RestaurantScheduleData,
} from "../../services/horarios";

interface RestaurantSchedulesFormProps {
  restaurantId: number;
  token: string;
}

const dayIds = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function toOpeningDays(
  schedules: Awaited<ReturnType<typeof getRestaurantSchedules>>,
): OpeningDay[] {
  const days = createInitialOpeningDays();
  for (const schedule of schedules) {
    const day = days[schedule.dia_semana - 1];
    if (!day) continue;
    day.isOpen = true;
    day.shifts.push({
      id: String(schedule.id),
      start: schedule.hora_apertura.slice(0, 5),
      end: schedule.hora_cierre.slice(0, 5),
    });
  }
  return days;
}

function validateSchedules(days: OpeningDay[]): string | null {
  for (const day of days) {
    if (!day.isOpen) continue;
    if (day.shifts.length === 0) {
      return `Agregá al menos un turno para ${day.label.toLowerCase()}.`;
    }

    const shifts = day.shifts.map((shift) => {
      const [startHour, startMinute] = shift.start.split(":").map(Number);
      const [endHour, endMinute] = shift.end.split(":").map(Number);
      return {
        start: shift.start,
        end: shift.end,
        startMinutes: startHour * 60 + startMinute,
        endMinutes: endHour * 60 + endMinute,
      };
    });

    if (
      shifts.some(
        (shift) =>
          !shift.start ||
          !shift.end ||
          shift.endMinutes <= shift.startMinutes,
      )
    ) {
      return `Revisá los horarios de ${day.label.toLowerCase()}: el cierre debe ser posterior a la apertura.`;
    }

    const sortedShifts = [...shifts].sort(
      (first, second) => first.startMinutes - second.startMinutes,
    );
    if (
      sortedShifts.some(
        (shift, index) =>
          index > 0 && shift.startMinutes < sortedShifts[index - 1].endMinutes,
      )
    ) {
      return `Los turnos de ${day.label.toLowerCase()} no pueden superponerse.`;
    }
  }

  return days.some((day) => day.isOpen)
    ? null
    : "Configurá al menos un turno de atención.";
}

export function RestaurantSchedulesForm({
  restaurantId,
  token,
}: RestaurantSchedulesFormProps) {
  const [days, setDays] = useState(createInitialOpeningDays);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSchedules() {
      setLoading(true);
      setError(null);
      try {
        const schedules = await getRestaurantSchedules(
          restaurantId,
          token,
          controller.signal,
        );
        if (!controller.signal.aborted) setDays(toOpeningDays(schedules));
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los horarios.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSchedules();
    return () => controller.abort();
  }, [restaurantId, token]);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    const validationError = validateSchedules(days);
    if (validationError) {
      setError(validationError);
      return;
    }

    const horarios: RestaurantScheduleData[] = days.flatMap((day) => {
      if (!day.isOpen) return [];
      const dayNumber = dayIds.indexOf(day.id as (typeof dayIds)[number]) + 1;
      return day.shifts.map((shift) => ({
        dia_semana: dayNumber,
        hora_apertura: shift.start,
        hora_cierre: shift.end,
      }));
    });

    setSaving(true);
    try {
      const savedSchedules = await saveRestaurantSchedules(
        restaurantId,
        token,
        horarios,
      );
      setDays(toOpeningDays(savedSchedules));
      setSuccess("Los horarios se guardaron correctamente.");
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron guardar los horarios.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-eco-dark">Horarios de atención</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configurá los días y turnos en los que está abierto tu restaurante.
        </p>
      </div>

      {error && <GlobalAlert message={error} />}
      {success && <GlobalAlert message={success} variant="success" />}
      {loading ? (
        <p className="py-6 text-sm text-gray-600">Cargando horarios...</p>
      ) : (
        <>
          <RestaurantOpeningHours days={days} onChange={setDays} />
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="mt-6 rounded-lg border-2 border-eco-dark bg-eco-dark px-5 py-2 text-sm font-bold text-white hover:bg-eco-dark/90 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Guardando..." : "Guardar horarios"}
          </button>
        </>
      )}
    </section>
  );
}
