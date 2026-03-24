import { useQuery } from "@tanstack/react-query";
import { fetchPlans } from "@/lib/api";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    refetchInterval: 5_000,
  });
}
