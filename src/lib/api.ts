import type { PlanDetail, PlanMeta } from "@/types/plan";

export async function fetchPlans(): Promise<PlanMeta[]> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json() as Promise<PlanMeta[]>;
}

export async function fetchPlan(filename: string): Promise<PlanDetail> {
  const res = await fetch(`/api/plans/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`Failed to fetch plan: ${filename}`);
  return res.json() as Promise<PlanDetail>;
}
