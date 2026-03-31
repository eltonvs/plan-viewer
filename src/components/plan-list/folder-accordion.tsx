import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PlanMeta } from "@/types/plan";

import { PlanListItem } from "./plan-list-item";

interface FolderAccordionProps {
  label: string;
  plans: PlanMeta[];
  isCompleted: (filePath: string) => boolean;
  onToggleCompleted: (filePath: string) => void;
  onRemove?: () => void;
  onPlanSelect?: () => void;
}

export function FolderAccordion({
  label,
  plans,
  isCompleted,
  onToggleCompleted,
  onRemove,
  onPlanSelect,
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
        className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors"
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        )}
        <span className="min-w-0 truncate">{label}</span>
        <span className="text-muted-foreground ml-auto shrink-0 text-xs">
          {active.length}/{plans.length}
        </span>
        {onRemove && (
          <Tooltip>
            <TooltipTrigger
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 [button:hover>&]:opacity-100"
              aria-label="Remove folder"
            >
              <X className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent>Remove folder</TooltipContent>
          </Tooltip>
        )}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 px-2 pb-2">
            {plans.length === 0 && (
              <p className="text-muted-foreground px-3 py-2 text-xs">No .md files found</p>
            )}
            {active.map((plan) => (
              <PlanListItem
                key={plan.relativePath}
                plan={plan}
                isCompleted={false}
                onToggleCompleted={() => onToggleCompleted(plan.filePath)}
                onSelect={onPlanSelect}
              />
            ))}
            {completed.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setImplementedExpanded((v) => !v)}
                  className="flex w-full items-center gap-2 px-3 py-1"
                >
                  <div className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                    {implementedExpanded ? (
                      <ChevronDown className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronRight className="h-2.5 w-2.5" />
                    )}
                    Implemented ({completed.length})
                  </span>
                  <div className="bg-border h-px flex-1" />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${implementedExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    {completed.map((plan) => (
                      <PlanListItem
                        key={plan.relativePath}
                        plan={plan}
                        isCompleted
                        onToggleCompleted={() => onToggleCompleted(plan.filePath)}
                        onSelect={onPlanSelect}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
