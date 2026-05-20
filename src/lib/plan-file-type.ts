import type { PlanFileType } from "../types/plan.ts";

export function fileTypeFromName(name: string): PlanFileType | null {
  if (/\.html?$/i.test(name)) return "html";
  if (/\.md$/i.test(name)) return "md";
  return null;
}

export function stripPlanExtension(name: string): string {
  return name.replace(/\.(md|html?)$/i, "");
}
