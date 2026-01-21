"use client";

import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const periodDays = getAllPeriodDays(cycles);

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-center mb-2">歷史紀錄</h1>

        <Card>
          <CardContent className="p-0">
            <Calendar
              modifiers={{ periodDays }}
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
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            最近紀錄
          </h2>
          {cycles
            .slice()
            .reverse()
            .slice(0, 6)
            .map((cycle, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onEditCycle(cycle)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <span>
                      {format(new Date(cycle.startDate), "M月d日", {
                        locale: zhTW,
                      })}
                      {" - "}
                      {cycle.endDate
                        ? format(new Date(cycle.endDate), "M月d日", {
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

