"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";

import { DateRange } from "@/components/ui/calendar";
import {
  PeriodEvent,
  PeriodCycle,
  parsePeriodCycles,
  addPeriodStart,
  addPeriodEnd,
  getPeriodStatus,
} from "@/lib/period";
import { HomePage } from "./components/HomePage";

export default function HomeRoutePage() {
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Home page dialog states
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // dummy state for type compatibility with DateRange, not used on this page
  const [_editRange] = useState<DateRange>({ from: new Date(), to: null });
  const [_editingCycle] = useState<PeriodCycle | null>(null);

  // Load data
  useEffect(() => {
    fetch("/api/periods")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Save data
  const saveEvents = async (newEvents: PeriodEvent[]) => {
    setEvents(newEvents);
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvents),
    });
  };

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

    saveEvents(newEvents);
    setShowStartDialog(false);
    setSelectedDate(new Date());
  };

  // Handle end period
  const handleEndPeriod = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const newEvents = addPeriodEnd(events, dateStr);
    saveEvents(newEvents);
    setShowEndDialog(false);
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 p-4 pb-20 overflow-auto">
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

