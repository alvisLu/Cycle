import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { PencilIcon, Trash2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { PeriodCycle } from "@/lib/period";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CompletedCycle = PeriodCycle & { endDate: string };

interface CycleListItemProps {
  cycle: CompletedCycle;
  showSeparator: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CycleListItem({
  cycle,
  showSeparator,
  onClick,
  onEdit,
  onDelete,
}: CycleListItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const startDateString = format(new Date(cycle.startDate), "yyyy-MM-dd", { locale: zhTW });
  const endDateString = format(new Date(cycle.endDate), "yyyy-MM-dd", { locale: zhTW });
  const days =
    Math.ceil(
      (new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div>
      <div className="flex justify-between items-center">
        <button
          className="flex justify-between items-center py-2 flex-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClick}
        >
          <p className="text-sm leading-none font-medium">
            {startDateString} ~ {endDateString}
          </p>
          <Badge variant="ghost">{`${days} 天`}</Badge>
        </button>

        <div className="flex">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
          </Button>
        </div>
      </div>
      {showSeparator && <Separator />}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            確定要刪除 {startDateString} ~ {endDateString} 的紀錄嗎？
          </p>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button className="w-full" variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete();
              }}
            >
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
