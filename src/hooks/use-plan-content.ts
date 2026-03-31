import { useQuery } from "@tanstack/react-query";
import { fetchPlan } from "@/lib/api";
import { readPlanFromHandle } from "@/lib/fs-source";
import { useFolderContext } from "@/context/folder-context";

export function usePlanContent(filename: string) {
  const { handle } = useFolderContext();

  return useQuery({
    queryKey: ["plan", filename, handle ? "folder" : "api"],
    queryFn: () => (handle ? readPlanFromHandle(handle, filename) : fetchPlan(filename)),
    staleTime: 30_000,
    refetchInterval: 5_000,
    enabled: !!filename,
  });
}
