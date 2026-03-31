import { useQuery } from "@tanstack/react-query";
import { fetchPlan } from "@/lib/api";
import { readPlanFromHandle } from "@/lib/fs-source";
import { useFolderContext } from "@/context/folder-context";

export function usePlanContent(sourceId: string, relativePath: string) {
  const { sources } = useFolderContext();
  const source = sources.find((s) => s.id === sourceId);

  return useQuery({
    queryKey: ["plan", sourceId, relativePath],
    queryFn: () => {
      if (source?.handle) return readPlanFromHandle(source.handle, sourceId, relativePath);
      return fetchPlan(relativePath).then((p) => ({
        ...p,
        relativePath,
        sourceId: "api" as const,
        filePath: `api/${relativePath}`,
      }));
    },
    staleTime: 30_000,
    refetchInterval: 5_000,
    enabled: !!source,
  });
}
