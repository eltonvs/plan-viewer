import { useQuery } from "@tanstack/react-query";
import { fetchPlan } from "@/lib/api";

export function usePlanContent(filename: string) {
  return useQuery({
    queryKey: ["plan", filename],
    queryFn: () => fetchPlan(filename),
    staleTime: 30_000,
    enabled: !!filename,
  });
}
