export interface ApiPlanMeta {
  filename: string;
  filePath: string;
  title: string;
  modifiedAt: string;
  sizeBytes: number;
}

export interface ApiPlanDetail extends ApiPlanMeta {
  content: string;
}

export async function fetchPlans(): Promise<ApiPlanMeta[]> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json() as Promise<ApiPlanMeta[]>;
}

export async function fetchPlan(filename: string): Promise<ApiPlanDetail> {
  const res = await fetch(`/api/plans/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`Failed to fetch plan: ${filename}`);
  return res.json() as Promise<ApiPlanDetail>;
}
