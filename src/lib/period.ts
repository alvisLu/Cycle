import {
  parseISO,
  differenceInDays,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
  format,
  subMonths,
  startOfDay,
} from "date-fns";

// 將 ISO 日期字串解析為本地時區的午夜時間
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export interface PeriodEvent {
  date: string;
  event: "Starts" | "Ends";
}

export interface PeriodCycle {
  startDate: string;
  endDate: string | null;
}

// Parse period events into cycles
export function parsePeriodCycles(events: PeriodEvent[]): PeriodCycle[] {
  const cycles: PeriodCycle[] = [];
  let currentStart: string | null = null;

  for (const event of events) {
    if (event.event === "Starts") {
      currentStart = event.date;
    } else if (event.event === "Ends" && currentStart) {
      cycles.push({
        startDate: currentStart,
        endDate: event.date,
      });
      currentStart = null;
    }
  }

  // Handle ongoing period (started but not ended)
  if (currentStart) {
    cycles.push({
      startDate: currentStart,
      endDate: null,
    });
  }

  return cycles;
}

// Get current period status
export interface PeriodStatus {
  isOnPeriod: boolean;
  currentCycle: PeriodCycle | null;
  daysUntilEnd: number | null;
  daysUntilNext: number | null;
  daysSinceStart: number | null;
  averageCycleLength: number;
  averagePeriodLength: number | null;
}

export function getPeriodStatus(
  cycles: PeriodCycle[],
  today: Date = new Date()
): PeriodStatus {
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
      if (
        format(startDate, "yyyy-MM-dd") === todayStr ||
        isBefore(startDate, normalizedToday)
      ) {
        currentCycle = cycle;
        break;
      }
    }
  }

  const isOnPeriod = currentCycle !== null;

  // Completed cycles (有開始且有結束的週期)
  const completedCycles = cycles.filter((c) => c.endDate);

  // Calculate average cycle length（平均週期長度：兩次經期開始的間隔）
  let averageCycleLength = 28; // Default
  if (completedCycles.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < completedCycles.length; i++) {
      const prevStart = parseLocalDate(completedCycles[i - 1].startDate);
      const currStart = parseLocalDate(completedCycles[i].startDate);
      cycleLengths.push(differenceInDays(currStart, prevStart));
    }
    averageCycleLength = Math.round(
      cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    );
  }

  // Calculate average period length（平均經期天數：每次開始到結束的天數）
  let averagePeriodLength: number | null = null;
  // 只使用「過去 6 個月內」的完成週期來計算
  const sixMonthsAgo = subMonths(normalizedToday, 6);
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
    averagePeriodLength = Math.round(
      periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
    );
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
    } else if (averagePeriodLength !== null) {
      // 尚未設定結束日：用「平均經期天數」推估預期結束日
      const expectedEnd = addDays(start, averagePeriodLength - 1);
      daysUntilEnd = differenceInDays(expectedEnd, normalizedToday);
    }
  }

  // Calculate days until next period
  let daysUntilNext: number | null = null;
  if (!isOnPeriod && completedCycles.length > 0) {
    const lastCycle = completedCycles[completedCycles.length - 1];
    const lastStartDate = parseLocalDate(lastCycle.startDate);
    const expectedNextStart = addDays(lastStartDate, averageCycleLength);

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
    averageCycleLength,
    averagePeriodLength,
  };
}

// Get all days that are period days (for calendar highlighting)
export function getAllPeriodDays(cycles: PeriodCycle[]): Date[] {
  const days: Date[] = [];

  for (const cycle of cycles) {
    const startDate = parseLocalDate(cycle.startDate);
    const endDate = cycle.endDate
      ? parseLocalDate(cycle.endDate)
      : addDays(startDate, 6); // Default to 7 days if ongoing

    let current = startDate;
    while (current <= endDate) {
      days.push(current);
      current = addDays(current, 1);
    }
  }

  return days;
}

// Add a new period start
export function addPeriodStart(
  events: PeriodEvent[],
  date: string
): PeriodEvent[] {
  const newEvents = [...events, { date, event: "Starts" as const }];
  return newEvents.sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
}

// Add a period end
export function addPeriodEnd(
  events: PeriodEvent[],
  date: string
): PeriodEvent[] {
  const newEvents = [...events, { date, event: "Ends" as const }];
  return newEvents.sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
}

// Delete a period cycle
export function deletePeriodCycle(
  events: PeriodEvent[],
  startDate: string,
  endDate: string | null
): PeriodEvent[] {
  return events.filter((e) => {
    if (e.date === startDate && e.event === "Starts") return false;
    if (endDate && e.date === endDate && e.event === "Ends") return false;
    return true;
  });
}

// Update a period cycle
export function updatePeriodCycle(
  events: PeriodEvent[],
  oldStartDate: string,
  oldEndDate: string | null,
  newStartDate: string,
  newEndDate: string | null
): PeriodEvent[] {
  let newEvents = deletePeriodCycle(events, oldStartDate, oldEndDate);
  newEvents = addPeriodStart(newEvents, newStartDate);
  if (newEndDate) {
    newEvents = addPeriodEnd(newEvents, newEndDate);
  }
  return newEvents;
}
