"use client";

import { useState } from "react";
import { format, isSameMonth } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, DateRange } from "@/components/ui/calendar";
import { PeriodCycle, getAllPeriodDays } from "@/lib/period";

interface HistoryPageProps {
  cycles: PeriodCycle[];
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
  editRange,
  setEditRange,
  showEditDialog,
  setShowEditDialog,
  onEditCycle,
  onSaveEdit,
  onDeleteCycle,
}: HistoryPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const periodDays = getAllPeriodDays(cycles);

  // 找出當前月份的 cycles
  const cyclesInCurrentMonth = cycles.filter((cycle) => {
    const startDate = new Date(cycle.startDate);
    return isSameMonth(startDate, currentMonth);
  });

  return (
    <>
      <div className="flex flex-col gap-4 h-full overflow-hidden">
        <h1 className="text-xl font-semibold text-center">歷史紀錄</h1>

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
          <CardFooter className="justify-end p-2">
            <Button
              variant="default"
              size="sm"
              disabled={cyclesInCurrentMonth.length === 0}
              onClick={() => {
                if (cyclesInCurrentMonth.length > 0) {
                  onEditCycle(cyclesInCurrentMonth[0]);
                }
              }}
            >
              編輯紀錄
            </Button>
          </CardFooter>
        </Card>

        {/* Recent cycles list */}
        <div className="flex flex-col flex-1 min-h-0">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            最近紀錄
          </h2>
          <div className="space-y-2 overflow-y-auto flex-1">
            {cycles
              .slice()
              .reverse()
              .slice(0, 6)
              .map((cycle, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer bg-muted hover:bg-accent/50 transition-colors"
                  onClick={() => onEditCycle(cycle)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex justify-between items-center">
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
                      <span className="text-muted-foreground text-sm">
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
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Edit cycle dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[350px]">
          <DialogHeader>
            <DialogTitle>編輯經期紀錄</DialogTitle>
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
              <Button
                variant="destructive"
                onClick={onDeleteCycle}
                className="w-full"
              >
                刪除此紀錄
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

