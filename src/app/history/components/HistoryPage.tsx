"use client";

import { useState } from "react";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, DateRange } from "@/components/ui/calendar";
import { PeriodCycle, getAllPeriodDays } from "@/lib/period";
import { Separator } from "@/components/ui/separator";

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
                  setEditRange({ from: startOfMonth(currentMonth), to: null });
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

      {/* Edit/Add cycle dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[350px]">
          <DialogHeader>
            <DialogTitle>{isAddMode ? "新增經期紀錄" : "編輯經期紀錄"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Display selected range */}
            <div className="text-center text-sm text-muted-foreground">
              <span className="text-foreground font-medium">
                {format(editRange.from, "M月d日", { locale: zhTW })}
              </span>
              <span className="mx-2">-</span>
              <span className="text-foreground font-medium">
                {editRange.to
                  ? format(editRange.to, "M月d日", { locale: zhTW })
                  : "點選結束日期"}
              </span>
            </div>
            {/* Range calendar */}
            <Calendar
              mode="range"
              selectedRange={editRange}
              onSelectRange={setEditRange}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col w-full">
            <div className="w-full space-y-2">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button onClick={onSaveEdit} className="flex-1">
                  儲存
                </Button>
              </div>
              {!isAddMode && (
                <Button
                  variant="destructive"
                  onClick={onDeleteCycle}
                  className="w-full"
                >
                  刪除此紀錄
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

