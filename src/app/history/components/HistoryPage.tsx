"use client";

import { useState } from "react";
import { format, isSameMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DateRange } from "@/components/ui/calendar";
import { PeriodCycle, getAllPeriodDays } from "@/lib/period";
import { Separator } from "@/components/ui/separator";
import { EditCycleDialog } from "./EditCycleDialog";
import { CycleListItem } from "./CycleListItem";

interface HistoryPageProps {
  cycles: PeriodCycle[];
  editingCycle: PeriodCycle | null;
  editRange: DateRange;
  setEditRange: (range: DateRange) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  onEditCycle: (cycle: PeriodCycle) => void;
  onSaveEdit: () => void;
  onDeleteCycle: () => void;
  onDeleteSpecificCycle: (cycle: PeriodCycle) => void;
}

export function HistoryPage({
  cycles,
  editingCycle,
  editRange,
  setEditRange,
  showEditDialog,
  setShowEditDialog,
  onEditCycle,
  onSaveEdit,
  onDeleteCycle,
  onDeleteSpecificCycle,
}: HistoryPageProps) {
  const isAddMode = editingCycle === null;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const periodDays = getAllPeriodDays(cycles);
  const today = new Date();

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-0">
            <Calendar
              modifiers={{ periodDays }}
              onMonthChange={setCurrentMonth}
              month={currentMonth}
              selected={today}
              onSelect={(date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const cycle = cycles.find((c) => {
                  if (c.startDate === dateStr) return true;
                  if (c.endDate === dateStr) return true;
                  return false;
                });
                if (cycle) {
                  onEditCycle(cycle);
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Recent cycles list */}
        <Card className="flex flex-col h-[400px]">
          <CardHeader className="shrink-0 flex-row justify-between items-center">
            <CardTitle>最近紀錄</CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setEditRange({ from: null, to: null });
                setShowEditDialog(true);
              }}
            >
              新增紀錄
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            {cycles
              .slice()
              .reverse()
              .slice(0, 12)
              .map((cycle, idx, arr) => (
                <CycleListItem
                  key={idx}
                  cycle={cycle}
                  showSeparator={idx < arr.length - 1}
                  onClick={() => setCurrentMonth(new Date(cycle.startDate))}
                  onEdit={() => onEditCycle(cycle)}
                  onDelete={() => onDeleteSpecificCycle(cycle)}
                />
              ))}
          </CardContent>
        </Card>
      </div>

      <EditCycleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        isAddMode={isAddMode}
        editRange={editRange}
        onEditRangeChange={setEditRange}
        onSave={onSaveEdit}
      />
    </>
  );
}
