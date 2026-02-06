"use client";

import { useState } from "react";
import { format, isSameMonth } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DateRange } from "@/components/ui/calendar";
import { PeriodCycle, getAllPeriodDays } from "@/lib/period";
import { Separator } from "@/components/ui/separator";
import { EditCycleDialog } from "./EditCycleDialog";

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
}: HistoryPageProps) {
  const isAddMode = editingCycle === null;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const periodDays = getAllPeriodDays(cycles);
  const today = new Date();

  // 找出當前月份的 cycles
  const cyclesInCurrentMonth = cycles.filter((cycle) => {
    const startDate = new Date(cycle.startDate);
    return isSameMonth(startDate, currentMonth);
  });

  return (
    <>
      <div className="flex flex-col gap-4">

        <Card>
          <CardContent className="p-0">
            <Calendar
              modifiers={{ periodDays }}
              onMonthChange={setCurrentMonth}
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
          <Separator />
          <CardFooter className="justify-end p-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (cyclesInCurrentMonth.length > 0) {
                  onEditCycle(cyclesInCurrentMonth[0]);
                } else {
                  setEditRange({ from: today, to: null });
                  setShowEditDialog(true);
                }
              }}
            >
              {cyclesInCurrentMonth.length === 0 ? "新增紀錄" : "編輯紀錄"}
            </Button>
          </CardFooter>
        </Card>

        {/* Recent cycles list */}
        <Card className="flex flex-col h-[400px]">
          <CardHeader className="shrink-0">
            <CardTitle>最近紀錄</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            {cycles
              .slice()
              .reverse()
              .slice(0, 12)
              .map((cycle, idx, arr) => (
                <div key={idx}>
                  <div className="flex justify-between items-center py-2 text-muted-foreground">
                    <span>
                      {format(new Date(cycle.startDate), "yyyy-MM-dd", {
                        locale: zhTW,
                      })}
                      {" - "}
                      {cycle.endDate
                        ? format(new Date(cycle.endDate), "yyyy-MM-dd", {
                          locale: zhTW,
                        })
                        : "進行中"}
                    </span>
                    <span className="text-sm">
                      {cycle.endDate
                        ? `${Math.ceil(
                          (new Date(cycle.endDate).getTime() -
                            new Date(cycle.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                        ) + 1
                        } 天`
                        : ""}
                    </span>
                  </div>
                  {idx < arr.length - 1 && <Separator />}
                </div>
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
        onDelete={onDeleteCycle}
      />
    </>
  );
}

