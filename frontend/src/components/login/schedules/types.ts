export interface ScheduleShift {
  id: string;
  start: string;
  end: string;
}

export interface OpeningDay {
  id: string;
  label: string;
  isOpen: boolean;
  shifts: ScheduleShift[];
}
