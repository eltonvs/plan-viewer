import { Suspense, lazy } from "react";
import { usePlanContent } from "@/hooks/use-plan-content";
import { PlanHeader } from "./plan-header";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

const MarkdownRenderer = lazy(() =>
  import("./markdown-renderer").then((m) => ({ default: m.MarkdownRenderer })),
);

interface PlanViewerProps {
  filename: string;
}

export function PlanViewer({ filename }: PlanViewerProps) {
  const { data: plan, isLoading, error } = usePlanContent(filename);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !plan) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Failed to load plan: {filename}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PlanHeader
        title={plan.title}
        filename={plan.filename}
        modifiedAt={plan.modifiedAt}
        sizeBytes={plan.sizeBytes}
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
