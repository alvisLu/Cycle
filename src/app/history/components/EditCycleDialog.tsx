"use client";

import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, DateRange } from "@/components/ui/calendar";

interface EditCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAddMode: boolean;
  editRange: DateRange;
  onEditRangeChange: (range: DateRange) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function EditCycleDialog({
  open,
  onOpenChange,
  isAddMode,
  editRange,
  onEditRangeChange,
  onSave,
  onDelete,
}: EditCycleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {editRange.to ? format(editRange.to, "M月d日", { locale: zhTW }) : "點選結束日期"}
            </span>
          </div>
          {/* Range calendar */}
          <Calendar
            mode="range"
            selectedRange={editRange}
            onSelectRange={onEditRangeChange}
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col w-full">
          <div className="w-full space-y-2">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                取消
              </Button>
              <Button onClick={onSave} className="flex-1">
                儲存
              </Button>
            </div>
            {!isAddMode && (
              <Button variant="destructive" onClick={onDelete} className="w-full">
                刪除此紀錄
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
