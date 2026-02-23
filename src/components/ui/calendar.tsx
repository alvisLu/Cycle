"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { zhTW } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface DateRange {
  from: Date;
  to: Date | null;
}

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  modifiers?: {
    periodDays?: Date[];
  };
  // Range selection mode
  mode?: "single" | "range";
  selectedRange?: DateRange;
  onSelectRange?: (range: DateRange) => void;
  // Month change callback
  onMonthChange?: (month: Date) => void;
  // Controlled month
  month?: Date;
}

function Calendar({
  selected,
  onSelect,
  className,
  modifiers,
  mode = "single",
  selectedRange,
  onSelectRange,
  onMonthChange,
  month,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    month ?? selectedRange?.from ?? selected ?? new Date()
  );

  React.useEffect(() => {
    if (month) setCurrentMonth(month);
  }, [month]);

  const periodDaysSet = React.useMemo(() => {
    const set = new Set<string>();
    modifiers?.periodDays?.forEach((d) => {
      set.add(format(d, "yyyy-MM-dd"));
    });
    return set;
  }, [modifiers?.periodDays]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  // Always show 6 weeks for consistent calendar height
  while (weeks.length < 6) {
    const lastDay = weeks[weeks.length - 1][6];
    const nextWeek: Date[] = [];
    for (let i = 1; i <= 7; i++) {
      nextWeek.push(addDays(lastDay, i));
    }
    weeks.push(nextWeek);
  }

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  // Check if a date is within the selected range
  const isInRange = (date: Date): boolean => {
    if (mode !== "range" || !selectedRange?.from || !selectedRange?.to) return false;
    const from = selectedRange.from;
    const to = selectedRange.to;
    return isWithinInterval(date, {
      start: isBefore(from, to) ? from : to,
      end: isAfter(from, to) ? from : to,
    });
  };

  const isRangeStart = (date: Date): boolean => {
    if (mode !== "range" || !selectedRange?.from) return false;
    return isSameDay(date, selectedRange.from);
  };

  const isRangeEnd = (date: Date): boolean => {
    if (mode !== "range" || !selectedRange?.to) return false;
    return isSameDay(date, selectedRange.to);
  };

  const handleDateClick = (date: Date) => {
    if (mode === "range" && onSelectRange) {
      if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
        // Start new selection
        onSelectRange({ from: date, to: null });
      } else {
        // Complete the selection
        const from = selectedRange.from;
        if (isBefore(date, from)) {
          onSelectRange({ from: date, to: from });
        } else {
          onSelectRange({ from, to: date });
        }
      }
    } else {
      onSelect?.(date);
    }
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">
          {format(currentMonth, "yyyy年 M月", { locale: zhTW })}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIdx) =>
          week.map((dayDate, dayIdx) => {
            const isCurrentMonth = isSameMonth(dayDate, currentMonth);
            const isSelected = mode === "single" && selected && isSameDay(dayDate, selected);
            const isPeriodDay = periodDaysSet.has(format(dayDate, "yyyy-MM-dd"));
            const inRange = isInRange(dayDate);
            const rangeStart = isRangeStart(dayDate);
            const rangeEnd = isRangeEnd(dayDate);
            return (
              <button
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => handleDateClick(dayDate)}
                className={cn(
                  "h-9 w-9 text-sm transition-colors",
                  // Default rounded
                  "rounded-full",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isCurrentMonth && "hover:bg-destructive hover:text-destructive-foreground",
                  // Single selection
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary ",
                  isPeriodDay &&
                  !isSelected &&
                  !inRange &&
                  !rangeStart &&
                  !rangeEnd &&
                  "bg-border text-foreground",
                  // Range selection styling
                  inRange && !rangeStart && !rangeEnd && "bg-primary/20 rounded-none",
                  rangeStart && "bg-foreground text-background rounded-l-full rounded-r-none",
                  rangeEnd && "bg-foreground text-background rounded-r-full rounded-l-none",
                  rangeStart && rangeEnd && "rounded-full",
                  // When only start is selected (no end yet)
                  rangeStart && !selectedRange?.to && "rounded-full"
                )}
              >
                {format(dayDate, "d")}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
