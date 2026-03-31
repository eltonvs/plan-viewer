import { Suspense, lazy } from "react";
import { usePlanContent } from "@/hooks/use-plan-content";
import { useCompletedPlans } from "@/hooks/use-completed-plans";
import { PlanHeader } from "./plan-header";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

const MarkdownRenderer = lazy(() =>
  import("./markdown-renderer").then((m) => ({ default: m.MarkdownRenderer })),
);

interface PlanViewerProps {
  sourceId: string;
  relativePath: string;
}

export function PlanViewer({ sourceId, relativePath }: PlanViewerProps) {
  const { data: plan, isLoading, error } = usePlanContent(sourceId, relativePath);
  const { isCompleted, toggleCompleted } = useCompletedPlans();

  if (isLoading) return <LoadingSkeleton />;
  if (error || !plan) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Failed to load plan: {relativePath}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PlanHeader
        title={plan.title}
        relativePath={plan.relativePath}
        filePath={plan.filePath}
        modifiedAt={plan.modifiedAt}
        sizeBytes={plan.sizeBytes}
        isCompleted={isCompleted(plan.filePath)}
        onToggleCompleted={() => toggleCompleted(plan.filePath)}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <MarkdownRenderer content={plan.content} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
