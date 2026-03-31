import { useMemo, useState } from "react";
import { EyeOff, Eye, FolderOpen, Moon, Star, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlans } from "@/hooks/use-plans";
import { useTheme } from "@/hooks/use-theme";
import { useCompletedPlans } from "@/hooks/use-completed-plans";
import { PlanSearch } from "@/components/plan-list/plan-search";
import { FolderAccordion } from "@/components/plan-list/folder-accordion";
import { useFolderContext } from "@/context/folder-context";

export function Sidebar() {
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
    <div className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
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
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Star on GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </TooltipTrigger>
            <TooltipContent>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> Star on GitHub
              </span>
            </TooltipContent>
          </Tooltip>
          <h2 className="font-heading text-base font-semibold">Plan Viewer</h2>
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
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
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
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
