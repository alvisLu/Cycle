"use client";

import { useState, useEffect } from "react";
import { Home, CalendarDays, Plus, Check } from "lucide-react";
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
import {
  PeriodEvent,
  PeriodCycle,
  parsePeriodCycles,
  getPeriodStatus,
  getAllPeriodDays,
  addPeriodStart,
  addPeriodEnd,
  deletePeriodCycle,
  updatePeriodCycle,
} from "@/lib/period";

type Tab = "home" | "history";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingCycle, setEditingCycle] = useState<PeriodCycle | null>(null);
  const [editStartDate, setEditStartDate] = useState<Date>(new Date());
  const [editEndDate, setEditEndDate] = useState<Date | null>(null);

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
  const status = getPeriodStatus(cycles);
  const periodDays = getAllPeriodDays(cycles);

  // Check if there's an ongoing period
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

  // Handle edit cycle
  const handleEditCycle = (cycle: PeriodCycle) => {
    setEditingCycle(cycle);
    setEditStartDate(new Date(cycle.startDate));
    setEditEndDate(cycle.endDate ? new Date(cycle.endDate) : null);
    setShowEditDialog(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingCycle) return;
    const newEvents = updatePeriodCycle(
      events,
      editingCycle.startDate,
      editingCycle.endDate,
      format(editStartDate, "yyyy-MM-dd"),
      editEndDate ? format(editEndDate, "yyyy-MM-dd") : null
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Main content */}
      <main className="flex-1 p-4 pb-20 overflow-auto">
        {tab === "home" && (
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
        )}

        {tab === "history" && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-center mb-2">歷史紀錄</h1>

            <Card>
              <CardContent className="p-0">
                <Calendar
                  modifiers={{ periodDays }}
                  onSelect={(date) => {
                    // Find cycle for selected date
                    const dateStr = format(date, "yyyy-MM-dd");
                    const cycle = cycles.find((c) => {
                      if (c.startDate === dateStr) return true;
                      if (c.endDate === dateStr) return true;
                      return false;
                    });
                    if (cycle) {
                      handleEditCycle(cycle);
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
                    onClick={() => handleEditCycle(cycle)}
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
                              ) + 1} 天`
                            : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => setTab("home")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              tab === "home"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">主頁</span>
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              tab === "history"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs">歷史</span>
          </button>
        </div>
      </nav>

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
            <Button onClick={handleStartPeriod}>確定</Button>
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
            <Button onClick={handleEndPeriod}>確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit cycle dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[350px]">
          <DialogHeader>
            <DialogTitle>編輯經期紀錄</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">開始日期</p>
              <Calendar selected={editStartDate} onSelect={setEditStartDate} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">結束日期</p>
              <Calendar
                selected={editEndDate ?? undefined}
                onSelect={setEditEndDate}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1">
                儲存
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteCycle}
              className="w-full"
            >
              刪除此紀錄
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
