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
  deletePeriodCycle,
  updatePeriodCycle,
} from "@/lib/period";
import { HistoryPage } from "./components/HistoryPage";

export default function HistoryRoutePage() {
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState<PeriodCycle | null>(null);
  const [editRange, setEditRange] = useState<DateRange>({
    from: new Date(),
    to: null,
  });

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

  // Handle edit cycle
  const handleEditCycle = (cycle: PeriodCycle) => {
    setEditingCycle(cycle);
    setEditRange({
      from: new Date(cycle.startDate),
      to: cycle.endDate ? new Date(cycle.endDate) : null,
    });
    setShowEditDialog(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingCycle) return;
    const newEvents = updatePeriodCycle(
      events,
      editingCycle.startDate,
      editingCycle.endDate,
      format(editRange.from, "yyyy-MM-dd"),
      editRange.to ? format(editRange.to, "yyyy-MM-dd") : null
    );
    saveEvents(newEvents);
    setShowEditDialog(false);
    setEditingCycle(null);
  };

  // Handle delete cycle
  const handleDeleteCycle = () => {
    if (!editingCycle) return;
    const newEvents = deletePeriodCycle(
      events,
      editingCycle.startDate,
      editingCycle.endDate
    );
    saveEvents(newEvents);
    setShowEditDialog(false);
    setEditingCycle(null);
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
        <HistoryPage
          cycles={cycles}
          editRange={editRange}
          setEditRange={setEditRange}
          showEditDialog={showEditDialog}
          setShowEditDialog={setShowEditDialog}
          onEditCycle={handleEditCycle}
          onSaveEdit={handleSaveEdit}
          onDeleteCycle={handleDeleteCycle}
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

