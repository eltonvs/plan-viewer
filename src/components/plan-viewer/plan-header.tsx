import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PlanHeaderProps {
  title: string;
  filename: string;
  modifiedAt: string;
  sizeBytes: number;
  isCompleted: boolean;
  onToggleCompleted: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PlanHeader({
  title,
  filename,
  modifiedAt,
  sizeBytes,
  isCompleted,
  onToggleCompleted,
}: PlanHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            onClick={onToggleCompleted}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              isCompleted
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 text-transparent hover:border-primary/50 hover:text-primary/30",
            )}
            aria-label={isCompleted ? "Mark as not implemented" : "Mark as implemented"}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </TooltipTrigger>
          <TooltipContent>
            {isCompleted ? "Mark as not implemented" : "Mark as implemented"}
          </TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <h1
            className={cn(
              "truncate font-heading text-lg font-semibold",
              isCompleted && "text-muted-foreground line-through decoration-muted-foreground/40",
            )}
          >
            {title}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{filename}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isCompleted && (
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
            <Circle className="mr-1 h-2 w-2 fill-current" />
            Implemented
          </Badge>
        )}
        <Badge variant="secondary" className="font-mono text-xs">
          {formatBytes(sizeBytes)}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(modifiedAt)}</span>
      </div>
    </div>
  );
}
