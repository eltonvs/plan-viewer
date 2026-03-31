import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlanListItem } from "./plan-list-item";
import type { PlanMeta } from "@/types/plan";

interface FolderAccordionProps {
  label: string;
  plans: PlanMeta[];
  isCompleted: (filePath: string) => boolean;
  onToggleCompleted: (filePath: string) => void;
  onRemove?: () => void;
}

export function FolderAccordion({
  label,
  plans,
  isCompleted,
  onToggleCompleted,
  onRemove,
}: FolderAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const [implementedExpanded, setImplementedExpanded] = useState(false);

  const active = plans.filter((p) => !isCompleted(p.filePath));
  const completed = plans.filter((p) => isCompleted(p.filePath));

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 truncate">{label}</span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {active.length}/{plans.length}
        </span>
        {onRemove && (
          <Tooltip>
            <TooltipTrigger
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 [button:hover>&]:opacity-100"
              aria-label="Remove folder"
            >
              <X className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent>Remove folder</TooltipContent>
          </Tooltip>
        )}
      </button>
      {expanded && (
        <div className="space-y-1 px-2 pb-2">
          {plans.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No .md files found</p>
          )}
          {active.map((plan) => (
            <PlanListItem
              key={plan.relativePath}
              plan={plan}
              isCompleted={false}
              onToggleCompleted={() => onToggleCompleted(plan.filePath)}
            />
          ))}
          {completed.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setImplementedExpanded((v) => !v)}
                className="flex w-full items-center gap-2 px-3 py-1"
              >
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {implementedExpanded ? (
                    <ChevronDown className="h-2.5 w-2.5" />
                  ) : (
                    <ChevronRight className="h-2.5 w-2.5" />
                  )}
                  Implemented ({completed.length})
                </span>
                <div className="h-px flex-1 bg-border" />
              </button>
              {implementedExpanded &&
                completed.map((plan) => (
                  <PlanListItem
                    key={plan.relativePath}
                    plan={plan}
                    isCompleted
                    onToggleCompleted={() => onToggleCompleted(plan.filePath)}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
