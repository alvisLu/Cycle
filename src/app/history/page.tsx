"use client";

import { useState } from "react";
import { format } from "date-fns";

import { DateRange } from "@/components/ui/calendar";
import {
  PeriodCycle,
  parsePeriodCycles,
  deletePeriodCycle,
  updatePeriodCycle,
  addPeriodStart,
  addPeriodEnd,
} from "@/lib/period";
import { usePeriods } from "@/hooks/usePeriods";
import { HistoryPage } from "./components/HistoryPage";
import { Spinner } from "@/components/ui/spinner";

export default function HistoryRoutePage() {
  const { periods: events, loading, savePeriods } = usePeriods();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState<PeriodCycle | null>(null);
  const [editRange, setEditRange] = useState<DateRange>({
    from: new Date(),
    to: null,
  });

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
    let newEvents;

    if (editingCycle) {
      // 編輯模式
      newEvents = updatePeriodCycle(events, editingCycle.startDate, {
        startDate: editRange.from ? format(editRange.from, "yyyy-MM-dd") : editingCycle.startDate,
        endDate: editRange.to ? format(editRange.to, "yyyy-MM-dd") : null,
      });
    } else {
      // 新增模式
      if (!editRange.from) return;
      newEvents = addPeriodStart(events, format(editRange.from, "yyyy-MM-dd"));
      if (editRange.to) {
        newEvents = addPeriodEnd(newEvents, format(editRange.to, "yyyy-MM-dd"));
      }
    }

    savePeriods(newEvents);
    setShowEditDialog(false);
    setEditingCycle(null);
  };

  // Handle delete cycle (from edit dialog)
  const handleDeleteCycle = () => {
    if (!editingCycle) return;
    const newEvents = deletePeriodCycle(events, editingCycle.startDate, editingCycle.endDate);
    savePeriods(newEvents);
    setShowEditDialog(false);
    setEditingCycle(null);
  };

  // Handle delete cycle directly (from list item)
  const handleDeleteSpecificCycle = (cycle: PeriodCycle) => {
    const newEvents = deletePeriodCycle(events, cycle.startDate, cycle.endDate);
    savePeriods(newEvents);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <HistoryPage
      cycles={cycles}
      editingCycle={editingCycle}
      editRange={editRange}
      setEditRange={setEditRange}
      showEditDialog={showEditDialog}
      setShowEditDialog={setShowEditDialog}
      onEditCycle={handleEditCycle}
      onSaveEdit={handleSaveEdit}
      onDeleteCycle={handleDeleteCycle}
      onDeleteSpecificCycle={handleDeleteSpecificCycle}
    />
  );
}
