import { Link } from "@tanstack/react-router";
import { EyeOff, Eye, FolderOpen, Moon, Star, Sun } from "lucide-react";
import { useMemo, useState } from "react";

import { GithubIcon } from "@/components/common/github-icon";
import { FolderAccordion } from "@/components/plan-list/folder-accordion";
import { PlanSearch } from "@/components/plan-list/plan-search";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFolderContext } from "@/context/folder-context";
import { useCompletedPlans } from "@/hooks/use-completed-plans";
import { usePlans } from "@/hooks/use-plans";
import { useTheme } from "@/hooks/use-theme";

interface SidebarProps {
  onPlanSelect?: () => void;
}

export function Sidebar({ onPlanSelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const { data: plans, isLoading } = usePlans();
  const { theme, toggleTheme } = useTheme();
  const { isCompleted, toggleCompleted } = useCompletedPlans();
  const { sources, isSupported, addFolder, removeFolder } = useFolderContext();

  const completedCount = plans?.filter((p) => isCompleted(p.filePath)).length ?? 0;

  const filteredBySource = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = (plans ?? []).filter((p) => {
      if (
        query &&
        !p.title.toLowerCase().includes(query) &&
        !p.relativePath.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (hideCompleted && isCompleted(p.filePath)) return false;
      return true;
    });

    const grouped = new Map<string, typeof filtered>();
    for (const source of sources) {
      grouped.set(source.id, []);
    }
    for (const plan of filtered) {
      const list = grouped.get(plan.sourceId);
      if (list) list.push(plan);
    }
    return grouped;
  }, [plans, sources, searchQuery, hideCompleted, isCompleted]);

  return (
    <div className="border-border bg-sidebar flex h-full w-80 flex-col border-r">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href="https://github.com/eltonvs/plan-viewer"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition-colors"
              aria-label="Star on GitHub"
            >
              <GithubIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> Star on GitHub
              </span>
            </TooltipContent>
          </Tooltip>
          <Link
            to="/"
            className="font-heading hover:text-primary text-base font-semibold transition-colors"
          >
            Plan Viewer
          </Link>
          {plans && (
            <Badge variant="secondary" className="font-mono text-xs">
              {plans.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {completedCount > 0 && (
            <Tooltip>
              <TooltipTrigger
                onClick={() => setHideCompleted((v) => !v)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
                aria-label={hideCompleted ? "Show implemented plans" : "Hide implemented plans"}
              >
                {hideCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </TooltipTrigger>
              <TooltipContent>
                {hideCompleted ? "Show implemented plans" : "Hide implemented plans"}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger
              onClick={toggleTheme}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </TooltipTrigger>
            <TooltipContent>{theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="px-3 pb-3">
        <PlanSearch value={searchQuery} onChange={setSearchQuery} />
      </div>
      <Separator />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          sources.map((source) => (
            <FolderAccordion
              key={source.id}
              label={source.label}
              plans={filteredBySource.get(source.id) ?? []}
              isCompleted={isCompleted}
              onToggleCompleted={toggleCompleted}
              onRemove={source.id !== "api" ? () => removeFolder(source.id) : undefined}
              onPlanSelect={onPlanSelect}
            />
          ))
        )}
      </div>
      {isSupported && (
        <>
          <Separator />
          <div className="px-4 py-2.5">
            <button
              type="button"
              onClick={() => void addFolder()}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Open Folder
            </button>
          </div>
        </>
      )}
    </div>
  );
}
