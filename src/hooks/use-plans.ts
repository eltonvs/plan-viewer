import { useQuery } from "@tanstack/react-query";
import { fetchPlans } from "@/lib/api";
import { readPlansFromHandle } from "@/lib/fs-source";
import { useFolderContext } from "@/context/folder-context";

export function usePlans() {
  const { handle } = useFolderContext();

  return useQuery({
    queryKey: ["plans", handle ? "folder" : "api"],
    queryFn: () => (handle ? readPlansFromHandle(handle) : fetchPlans()),
    refetchInterval: 5_000,
  });
}
