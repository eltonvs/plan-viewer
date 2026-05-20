import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanFileType } from "@/types/plan";

interface FileTypeBadgeProps {
  fileType: PlanFileType;
  className?: string;
}

export function FileTypeBadge({ fileType, className }: FileTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-1.5 py-0 font-mono text-[10px] uppercase",
        fileType === "html" && "border-amber-500/40 text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      {fileType}
    </Badge>
  );
}
