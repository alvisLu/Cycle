"use client";

import { Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { PeriodCycle, getPeriodStatus } from "@/lib/period";

interface HomePageProps {
  cycles: PeriodCycle[];
  hasOngoingPeriod: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  showStartDialog: boolean;
  setShowStartDialog: (show: boolean) => void;
  showEndDialog: boolean;
  setShowEndDialog: (show: boolean) => void;
  onStartPeriod: () => void;
  onEndPeriod: () => void;
}

export function HomePage({
  cycles,
  hasOngoingPeriod,
  selectedDate,
  setSelectedDate,
  showStartDialog,
  setShowStartDialog,
  showEndDialog,
  setShowEndDialog,
  onStartPeriod,
  onEndPeriod,
}: HomePageProps) {
  const status = getPeriodStatus(cycles);

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-center mb-6">經期追蹤</h1>

        {/* Status card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhTW })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.isOnPeriod ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-center py-4">
                  經期中
                </div>
                <p className="text-center text-muted-foreground">
                  已經第 {(status.daysSinceStart ?? 0) + 1} 天
                </p>
                {status.daysUntilEnd !== null && status.daysUntilEnd > 0 && (
                  <p className="text-center text-muted-foreground">
                    預計還有 {status.daysUntilEnd} 天結束
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-center py-4">
                  {status.daysUntilNext !== null ? (
                    status.daysUntilNext > 0 ? (
                      <>距離下次經期約 {status.daysUntilNext} 天</>
                    ) : (
                      <>經期可能已遲到 {Math.abs(status.daysUntilNext)} 天</>
                    )
                  ) : (
                    <>暫無資料</>
                  )}
                </div>
                <p className="text-center text-muted-foreground text-sm">
                  平均週期: {status.averageCycleLength} 天
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!hasOngoingPeriod ? (
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setShowStartDialog(true);
              }}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              經期開始
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setShowEndDialog(true);
              }}
              className="flex-1"
              variant="outline"
            >
              <Check className="mr-2 h-4 w-4" />
              經期結束
            </Button>
          )}
        </div>
      </div>

      {/* Start period dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-[350px]">
          <DialogHeader>
            <DialogTitle>經期開始日期</DialogTitle>
          </DialogHeader>
          <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              取消
            </Button>
            <Button onClick={onStartPeriod}>確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End period dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-[350px]">
          <DialogHeader>
            <DialogTitle>經期結束日期</DialogTitle>
          </DialogHeader>
          <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              取消
            </Button>
            <Button onClick={onEndPeriod}>確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

