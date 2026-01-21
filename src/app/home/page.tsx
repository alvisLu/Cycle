"use client";

import { useEffect, useState } from "react";
import { Home, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DateRange } from "@/components/ui/calendar";
import {
  PeriodEvent,
  PeriodCycle,
  parsePeriodCycles,
  addPeriodStart,
  addPeriodEnd,
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

  const pathname = usePathname();

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
  const hasOngoingPeriod = cycles.some((c) => c.endDate === null);

  // Handle start period
  const handleStartPeriod = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const newEvents = addPeriodStart(events, dateStr);
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

  const isHome = pathname === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 p-4 pb-20 overflow-auto">
        <HomePage
          cycles={cycles}
          hasOngoingPeriod={hasOngoingPeriod}
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

      {/* Bottom navigation using real routes */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto flex">
          <Link
            href="/"
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${isHome
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">主頁</span>
          </Link>
          <Link
            href="/history"
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${!isHome
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs">歷史</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

