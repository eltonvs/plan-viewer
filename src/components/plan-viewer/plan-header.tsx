import { useState } from "react";
import { Check, Circle, Copy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

interface PlanHeaderProps {
  title: string;
  relativePath: string;
  filePath: string;
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
  relativePath,
  filePath,
  modifiedAt,
  sizeBytes,
  isCompleted,
  onToggleCompleted,
}: PlanHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
          <div className="group/path mt-0.5 flex items-center gap-1">
            <p className="truncate font-mono text-xs text-muted-foreground">{relativePath}</p>
            <Tooltip>
              <TooltipTrigger
                onClick={handleCopy}
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/path:opacity-100"
                aria-label="Copy path"
              >
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy path"}</TooltipContent>
            </Tooltip>
          </div>
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
        <Tooltip>
          <TooltipTrigger
            onClick={() => navigate({ to: "/" })}
            className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close plan"
          >
            <X className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Close</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
