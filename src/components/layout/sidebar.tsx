import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlans } from "@/hooks/use-plans";
import { useTheme } from "@/hooks/use-theme";
import { PlanList } from "@/components/plan-list/plan-list";
import { PlanSearch } from "@/components/plan-list/plan-search";

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: plans, isLoading } = usePlans();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold">Claude Plans</h2>
          {plans && (
            <Badge variant="secondary" className="font-mono text-xs">
              {plans.length}
            </Badge>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
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
          <PlanList plans={plans ?? []} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
