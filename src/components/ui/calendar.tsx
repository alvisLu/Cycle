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
} from "date-fns";
import { zhTW } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  modifiers?: {
    periodDays?: Date[];
  };
}

function Calendar({
  selected,
  onSelect,
  className,
  modifiers,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

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

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">
          {format(currentMonth, "yyyy年 M月", { locale: zhTW })}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
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
            const isSelected = selected && isSameDay(dayDate, selected);
            const isPeriodDay = periodDaysSet.has(format(dayDate, "yyyy-MM-dd"));

            return (
              <button
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => onSelect?.(dayDate)}
                className={cn(
                  "h-9 w-9 rounded-full text-sm transition-colors",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isCurrentMonth && "hover:bg-accent",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  isPeriodDay && !isSelected && "bg-gray-300 text-gray-800"
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
