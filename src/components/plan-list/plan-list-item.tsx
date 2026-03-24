import type { MouseEvent } from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PlanMeta } from "@/types/plan";

function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface PlanListItemProps {
  plan: PlanMeta;
  isCompleted: boolean;
  onToggleCompleted: () => void;
}

export function PlanListItem({ plan, isCompleted, onToggleCompleted }: PlanListItemProps) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({
    to: "/plan/$filename",
    params: { filename: plan.filename },
  });

  const displayTitle =
    plan.title !== plan.filename.replace(/\.md$/, "").replaceAll("-", " ")
      ? plan.title
      : humanizeFilename(plan.filename);

  function handleToggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleCompleted();
  }

  return (
    <Link
      to="/plan/$filename"
      params={{ filename: plan.filename }}
      className={cn(
        "group relative block rounded-lg border border-transparent px-3 py-2.5 transition-colors",
        isActive ? "border-primary/30 bg-accent text-accent-foreground" : "hover:bg-muted",
        isCompleted && !isActive && "opacity-50",
      )}
    >
      <div className="flex items-start gap-2">
        {isCompleted ? (
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger
              onClick={handleToggle}
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-transparent opacity-0 transition-opacity group-hover:opacity-100 hover:border-primary/50 hover:text-primary/40"
              aria-label="Mark as implemented"
            >
              <Circle className="h-2.5 w-2.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Mark as implemented</TooltipContent>
          </Tooltip>
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isCompleted && "line-through decoration-muted-foreground/50",
            )}
          >
            {displayTitle}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(plan.modifiedAt)}
            </span>
            <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
              {formatBytes(plan.sizeBytes)}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
