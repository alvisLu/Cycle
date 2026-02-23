import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

import { Separator } from "@/components/ui/separator";
import { PeriodCycle } from "@/lib/period";

type CompletedCycle = PeriodCycle & { endDate: string };

interface CycleListItemProps {
  cycle: CompletedCycle;
  showSeparator: boolean;
  onClick: () => void;
}

export function CycleListItem({ cycle, showSeparator, onClick }: CycleListItemProps) {
  const startDateString = format(new Date(cycle.startDate), "yyyy-MM-dd", { locale: zhTW });
  const endDateString = format(new Date(cycle.endDate), "yyyy-MM-dd", { locale: zhTW });
  const days =
    Math.ceil(
      (new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div>
      <button
        className="flex justify-between items-center py-2 w-full text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClick}
      >
        <span>{`${startDateString} - ${endDateString}`}</span>
        <span className="text-sm">{`${days} 天`}</span>
      </button>
      {showSeparator && <Separator />}
    </div>
  );
}
