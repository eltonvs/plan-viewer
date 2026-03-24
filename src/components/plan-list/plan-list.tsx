import { PlanListItem } from "./plan-list-item";
import type { PlanMeta } from "@/types/plan";

interface PlanListProps {
  plans: PlanMeta[];
  searchQuery: string;
}

export function PlanList({ plans, searchQuery }: PlanListProps) {
  const query = searchQuery.toLowerCase();
  const filtered = query
    ? plans.filter(
        (p) => p.title.toLowerCase().includes(query) || p.filename.toLowerCase().includes(query),
      )
    : plans;

  if (filtered.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
        {searchQuery ? "No plans match your search" : "No plans found"}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {filtered.map((plan) => (
        <PlanListItem key={plan.filename} plan={plan} />
      ))}
    </div>
  );
}
