import { PlanListItem } from "./plan-list-item";
import type { PlanMeta } from "@/types/plan";

interface PlanListProps {
  plans: PlanMeta[];
  searchQuery: string;
  hideCompleted: boolean;
  isCompleted: (filename: string) => boolean;
  onToggleCompleted: (filename: string) => void;
}

export function PlanList({
  plans,
  searchQuery,
  hideCompleted,
  isCompleted,
  onToggleCompleted,
}: PlanListProps) {
  const query = searchQuery.toLowerCase();
  const filtered = plans.filter((p) => {
    if (
      query &&
      !p.title.toLowerCase().includes(query) &&
      !p.filename.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (hideCompleted && isCompleted(p.filename)) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
        {searchQuery
          ? "No plans match your search"
          : hideCompleted
            ? "No pending plans"
            : "No plans found"}
      </div>
    );
  }

  const active = filtered.filter((p) => !isCompleted(p.filename));
  const completed = filtered.filter((p) => isCompleted(p.filename));

  return (
    <div className="p-2">
      {active.length > 0 && (
        <div className="space-y-1">
          {active.map((plan) => (
            <PlanListItem
              key={plan.filename}
              plan={plan}
              isCompleted={false}
              onToggleCompleted={() => onToggleCompleted(plan.filename)}
            />
          ))}
        </div>
      )}
      {active.length > 0 && completed.length > 0 && (
        <div className="my-2 flex items-center gap-2 px-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Implemented
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      {completed.length > 0 && (
        <div className="space-y-1">
          {completed.map((plan) => (
            <PlanListItem
              key={plan.filename}
              plan={plan}
              isCompleted
              onToggleCompleted={() => onToggleCompleted(plan.filename)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
