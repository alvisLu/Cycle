"use client";

import { Plus, Check } from "lucide-react";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { PeriodCycle, getPeriodStatus } from "@/lib/period";

const styles = {
  pageWrapper: "space-y-4",
  pageTitle: "text-xl font-semibold text-center mb-6",
  statusMainTitle: "text-3xl font-bold text-center py-4",
  statusDaysText: "text-xl font-bold text-center",
  nextPeriodBlock: "space-y-2",
  nextPeriodInner: "py-4 flex flex-col items-center",
  nextPeriodTitle: "text-3xl font-bold text-center py-2",
  nextPeriodDate: "text-xl font-bold text-center",
  mutedSubText: "text-center text-muted-foreground",
  mutedSmallText: "text-center text-muted-foreground text-sm",
};

interface HomePageProps {
  cycles: PeriodCycle[];
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
  selectedDate,
  setSelectedDate,
  showStartDialog,
  setShowStartDialog,
  showEndDialog,
  setShowEndDialog,
  onStartPeriod,
  onEndPeriod,
}: HomePageProps) {
  const today = new Date();
  const status = getPeriodStatus(cycles, today);

  // 計算下次預期經期開始日期（只在非經期中且有完整紀錄時使用）
  const completedCycles = cycles.filter((c) => c.endDate !== null);
  const nextExpectedStart =
    !status.isOnPeriod && completedCycles.length > 0
      ? addDays(
        parseISO(completedCycles[completedCycles.length - 1].startDate),
        status.averageCycleLength
      )
      : null;

  const daysUntilNextFromToday = nextExpectedStart
    ? differenceInDays(nextExpectedStart, today)
    : null;

  // 預估本次經期的連續日期（用於「經期開始」對話框中的日曆高亮）
  const predictedPeriodDays =
    status.averagePeriodLength && status.averagePeriodLength > 0
      ? Array.from(
        { length: status.averagePeriodLength },
        (_, i) => addDays(selectedDate, i)
      )
      : [];

  // 目前這次經期開始日（用於「經期結束」對話框的 range 顯示）
  const currentCycleStartDate =
    status.currentCycle?.startDate ? parseISO(status.currentCycle.startDate) : null;

  const renderNextPeriodText = () => {
    if (!nextExpectedStart || daysUntilNextFromToday === null) return null;
    const formattedDate = format(nextExpectedStart, "M月d日", { locale: zhTW });

    return (
      <>
        {formattedDate}
        {daysUntilNextFromToday > 0 ?
          `(約 ${daysUntilNextFromToday} 天後)` :
          `(已遲到 ${Math.abs(daysUntilNextFromToday)} 天)`}
      </>
    );
  };

  return (
    <>
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>經期追蹤</h1>

        {/* Status card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              <div className="text-s font-bold flex justify-between items-center pt-2">
                <div>{format(today, "yyyy年M月d日 EEEE", { locale: zhTW })}</div>
                {status.averagePeriodLength !== null && (
                  <Badge variant="outline" className="text-xs">
                    平均經期: {status.averagePeriodLength} 天
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.isOnPeriod ? (
              <div className="space-y-2">
                <div className={styles.statusMainTitle}>
                  經期中
                </div>
                <p className={styles.statusDaysText}>
                  已經第 {(status.daysSinceStart ?? 0) + 1} 天
                </p>
                <p className={styles.mutedSmallText}>
                  {
                    (status.daysUntilEnd !== null && status.daysUntilEnd > 0) ?
                      ` 預計還有 ${status.daysUntilEnd} 天結束` : `今天結束。`
                  }
                </p>
              </div>
            ) : (
              <div className={styles.nextPeriodBlock}>
                <div className={styles.nextPeriodInner}>
                  {renderNextPeriodText() ? (
                    <>
                      <div className={styles.nextPeriodTitle}>
                        預計下次經期
                      </div>
                      <div className={styles.nextPeriodDate}>
                        {renderNextPeriodText()}
                      </div>
                    </>
                  ) : (
                    <div className={styles.nextPeriodDate}>暫無資料</div>
                  )}
                </div>
                <p className={styles.mutedSmallText}>
                  平均週期: {status.averageCycleLength} 天
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!status.isOnPeriod ? (
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
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ periodDays: predictedPeriodDays }}
          />
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
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            mode="range"
            selectedRange={
              currentCycleStartDate
                ? { from: currentCycleStartDate, to: selectedDate }
                : { from: selectedDate, to: selectedDate }
            }
          />
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

