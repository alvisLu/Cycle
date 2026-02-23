import {
  differenceInDays,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
  format,
  subMonths,
  startOfDay,
} from "date-fns";
import { AVERAGE_PERIOD_DAYS, AVERAGE_CYCLE_DAYS, AVERAGE_PERIOD_MONTH } from "@/lib/constants";

// 將 ISO 日期字串解析為本地時區的午夜時間
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export interface PeriodEvent {
  startDate: string;
  endDate: string;
  note: string;
}

export interface PeriodCycle {
  startDate: string;
  endDate: string;
}

// Parse period events into cycles
export function parsePeriodCycles(events: PeriodEvent[]): PeriodCycle[] {
  return [...events]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((e) => ({ startDate: e.startDate, endDate: e.endDate }));
}

// Get current period status
export interface PeriodStatus {
  isOnPeriod: boolean;
  currentCycle: PeriodCycle | null;
  daysUntilEnd: number | null;
  daysUntilNext: number | null;
  daysSinceStart: number | null;
  averageCycleDays: number;
  averagePeriodDays: number | null;
}

export function getPeriodStatus(cycles: PeriodCycle[], today: Date = new Date()): PeriodStatus {
  // 統一使用當天午夜時間，避免時區問題
  const normalizedToday = startOfDay(today);
  const todayStr = format(normalizedToday, "yyyy-MM-dd");

  // Find if currently on period
  let currentCycle: PeriodCycle | null = null;
  for (const cycle of cycles) {
    const startDate = parseLocalDate(cycle.startDate);
    const endDate = cycle.endDate ? parseLocalDate(cycle.endDate) : null;

    if (endDate) {
      if (
        isWithinInterval(normalizedToday, { start: startDate, end: endDate }) ||
        format(startDate, "yyyy-MM-dd") === todayStr ||
        format(endDate, "yyyy-MM-dd") === todayStr
      ) {
        currentCycle = cycle;
        break;
      }
    } else {
      // Ongoing period
      if (format(startDate, "yyyy-MM-dd") === todayStr || isBefore(startDate, normalizedToday)) {
        currentCycle = cycle;
        break;
      }
    }
  }

  const isOnPeriod = currentCycle !== null;

  // Completed cycles (有開始且有結束的週期)
  const completedCycles = cycles.filter((c) => c.endDate);

  // Calculate average cycle length（平均週期長度： 6 個月）
  let averageCycleDays = AVERAGE_CYCLE_DAYS;
  if (completedCycles.length >= AVERAGE_PERIOD_MONTH) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < completedCycles.length; i++) {
      const prevStart = parseLocalDate(completedCycles[i - 1].startDate);
      const currStart = parseLocalDate(completedCycles[i].startDate);
      cycleLengths.push(differenceInDays(currStart, prevStart));
    }
    averageCycleDays = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  }

  // Calculate average period length（平均經期天數：每次開始到結束的天數）
  let averagePeriodDays = AVERAGE_PERIOD_DAYS;
  // 只使用「過去 6 個月內」的完成週期來計算
  const sixMonthsAgo = subMonths(normalizedToday, AVERAGE_PERIOD_MONTH);
  const recentCompletedCycles = completedCycles.filter((c) => {
    const end = parseLocalDate(c.endDate as string);
    return !isBefore(end, sixMonthsAgo);
  });
  if (recentCompletedCycles.length > 0) {
    const periodLengths = recentCompletedCycles.map((c) => {
      const s = parseLocalDate(c.startDate);
      const e = parseLocalDate(c.endDate as string);
      // +1 代表首尾都算在內
      return differenceInDays(e, s) + 1;
    });
    averagePeriodDays = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
  }

  // Calculate days until end (if on period)
  let daysUntilEnd: number | null = null;
  let daysSinceStart: number | null = null;
  if (currentCycle) {
    const start = parseLocalDate(currentCycle.startDate);
    daysSinceStart = differenceInDays(normalizedToday, start);

    if (currentCycle.endDate) {
      // 已實際紀錄結束日
      daysUntilEnd = differenceInDays(parseLocalDate(currentCycle.endDate), normalizedToday);
    } else if (averagePeriodDays !== null) {
      // 尚未設定結束日：用「平均經期天數」推估預期結束日
      const expectedEnd = addDays(start, averagePeriodDays - 1);
      daysUntilEnd = differenceInDays(expectedEnd, normalizedToday);
    }
  }

  // Calculate days until next period
  let daysUntilNext: number | null = null;
  if (!isOnPeriod && completedCycles.length > 0) {
    const lastCycle = completedCycles[completedCycles.length - 1];
    const lastStartDate = parseLocalDate(lastCycle.startDate);
    const expectedNextStart = addDays(lastStartDate, averageCycleDays);

    if (isAfter(expectedNextStart, normalizedToday)) {
      daysUntilNext = differenceInDays(expectedNextStart, normalizedToday);
    } else {
      // Overdue
      daysUntilNext = differenceInDays(expectedNextStart, normalizedToday);
    }
  }

  return {
    isOnPeriod,
    currentCycle,
    daysUntilEnd,
    daysUntilNext,
    daysSinceStart,
    averageCycleDays,
    averagePeriodDays,
  };
}

// Get all days that are period days (for calendar highlighting)
export function getAllPeriodDays(cycles: PeriodCycle[]): Date[] {
  const days: Date[] = [];

  for (const cycle of cycles) {
    const startDate = parseLocalDate(cycle.startDate);
    const endDate = cycle.endDate ? parseLocalDate(cycle.endDate) : addDays(startDate, 6); // Default to 7 days if ongoing

    let current = startDate;
    while (current <= endDate) {
      days.push(current);
      current = addDays(current, 1);
    }
  }

  return days;
}

// Add a new period start
export function addPeriodStart(events: PeriodEvent[], date: string): PeriodEvent[] {
  const endDate = format(addDays(parseLocalDate(date), AVERAGE_PERIOD_DAYS), "yyyy-MM-dd");
  return [...events, { startDate: date, endDate, note: "" }].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
}

// Add a period end (updates the most recent ongoing period)
export function addPeriodEnd(events: PeriodEvent[], date: string): PeriodEvent[] {
  const sorted = [...events].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const target = sorted.find((e) => !e.endDate && e.startDate <= date);
  if (!target) return events;
  return events.map((e) => (e.startDate === target.startDate ? { ...e, endDate: date } : e));
}

// Delete a period cycle
export function deletePeriodCycle(
  events: PeriodEvent[],
  startDate: string,
  _endDate: string | null
): PeriodEvent[] {
  return events.filter((e) => e.startDate !== startDate);
}

// Update a period cycle
export function updatePeriodCycle(
  events: PeriodEvent[],
  oldStartDate: string,
  updates: { startDate: string; endDate: string | null }
): PeriodEvent[] {
  return events
    .map((e) =>
      e.startDate === oldStartDate
        ? { ...e, startDate: updates.startDate, endDate: updates.endDate ?? "" }
        : e
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}
