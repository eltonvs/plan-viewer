import { useQuery } from "@tanstack/react-query";

import { useFolderContext } from "@/context/folder-context";
import { fetchPlans } from "@/lib/api";
import { walkDirectory } from "@/lib/fs-source";

export function usePlans() {
  const { sources } = useFolderContext();

  return useQuery({
    queryKey: ["plans", sources.map((s) => s.id)],
    queryFn: async () => {
      const results = await Promise.all(
        sources.map((source) =>
          source.handle
            ? walkDirectory(source.handle, source.id)
            : fetchPlans().then((plans) =>
                plans.map((p) => ({
                  ...p,
                  relativePath: p.filename,
                  sourceId: "api" as const,
                  filePath: `api/${p.filename}`,
                })),
              ),
        ),
      );
      return results.flat();
    },
    refetchInterval: 5_000,
    enabled: sources.length > 0,
  });
}
