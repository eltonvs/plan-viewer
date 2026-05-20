import { useNavigate } from "@tanstack/react-router";
import { Check, Circle, Copy, X } from "lucide-react";
import { useState } from "react";

import { FileTypeBadge } from "@/components/common/file-type-badge";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PlanFileType } from "@/types/plan";

interface PlanHeaderProps {
  title: string;
  relativePath: string;
  filePath: string;
  modifiedAt: string;
  sizeBytes: number;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  fileType: PlanFileType;
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
  fileType,
}: PlanHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border-border flex items-center justify-between border-b px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            onClick={onToggleCompleted}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
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
            <p className="text-muted-foreground truncate font-mono text-xs">{relativePath}</p>
            <Tooltip>
              <TooltipTrigger
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover/path:opacity-100"
                aria-label="Copy path"
              >
                {copied ? <Check className="text-primary h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy path"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={cn(
            "grid transition-[grid-template-columns,opacity] duration-300 ease-in-out",
            isCompleted ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15 whitespace-nowrap">
              <Circle className="mr-1 h-2 w-2 fill-current" />
              Implemented
            </Badge>
          </div>
        </div>
        <FileTypeBadge fileType={fileType} />
        <Badge variant="secondary" className="font-mono text-xs">
          {formatBytes(sizeBytes)}
        </Badge>
        <span className="text-muted-foreground text-xs">{formatRelativeTime(modifiedAt)}</span>
        <Tooltip>
          <TooltipTrigger
            onClick={() => navigate({ to: "/" })}
            className="text-muted-foreground hover:bg-muted hover:text-foreground ml-1 rounded-md p-1 transition-colors"
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
