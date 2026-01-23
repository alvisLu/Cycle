"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";

import { DateRange } from "@/components/ui/calendar";
import {
  PeriodCycle,
  parsePeriodCycles,
  addPeriodStart,
  addPeriodEnd,
  getPeriodStatus,
} from "@/lib/period";
import { usePeriods } from "@/hooks/usePeriods";
import { HomePage } from "./components/HomePage";
import { Spinner } from "@/components/ui/spinner";

export default function HomeRoutePage() {
  const { periods: events, loading, savePeriods } = usePeriods();

  // Home page dialog states
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // dummy state for type compatibility with DateRange, not used on this page
  const [_editRange] = useState<DateRange>({ from: new Date(), to: null });
  const [_editingCycle] = useState<PeriodCycle | null>(null);

  const cycles = parsePeriodCycles(events);
  const status = getPeriodStatus(cycles);

  // Handle start period
  const handleStartPeriod = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    let newEvents = addPeriodStart(events, dateStr);

    // 依平均經期天數，自動帶入預設結束日
    if (status.averagePeriodLength && status.averagePeriodLength > 0) {
      const defaultEndDate = addDays(selectedDate, status.averagePeriodLength - 1);
      const defaultEndStr = format(defaultEndDate, "yyyy-MM-dd");
      newEvents = addPeriodEnd(newEvents, defaultEndStr);
    }

    savePeriods(newEvents);
    setShowStartDialog(false);
    setSelectedDate(new Date());
  };

  // Handle end period
  const handleEndPeriod = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const newEvents = addPeriodEnd(events, dateStr);
    savePeriods(newEvents);
    setShowEndDialog(false);
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        <HomePage
          cycles={cycles}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          showStartDialog={showStartDialog}
          setShowStartDialog={setShowStartDialog}
          showEndDialog={showEndDialog}
          setShowEndDialog={setShowEndDialog}
          onStartPeriod={handleStartPeriod}
          onEndPeriod={handleEndPeriod}
        />
      </main>
    </div>
  );
}

