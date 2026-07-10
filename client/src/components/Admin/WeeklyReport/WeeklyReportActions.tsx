import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";

type WeeklyReportActionsProps = {
  report: WeeklyReportType;
  onView: (report: WeeklyReportType) => void;
  onExport: (report: WeeklyReportType) => void;
};

export default function WeeklyReportActions({
  report,
  onView,
  onExport,
}: WeeklyReportActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Actions for ${report.reportCode}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(report)}>
          View Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport(report)}>
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
