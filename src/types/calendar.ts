/** Marcadores visuales del calendario mensual */

export type CalendarDayKind =
  | "period_confirmed"
  | "period_predicted"
  | "fertile"
  | "ovulation"
  | "today"
  | "pill_active"
  | "pill_rest"
  | "withdrawal";

export interface CalendarDayMarker {
  date: string;
  kinds: CalendarDayKind[];
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
}

export interface CalendarMonthGrid {
  year: number;
  month: number; // 1-12
  days: (CalendarDayMarker | null)[];
}

export interface CycleVariability {
  minDays: number | null;
  maxDays: number | null;
  sampleCount: number;
  messageKey: "calendar_variability_none" | "calendar_variability_range";
}
