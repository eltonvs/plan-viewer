import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
import { List } from "lucide-react";
import { usePlanContent } from "@/hooks/use-plan-content";
import { useCompletedPlans } from "@/hooks/use-completed-plans";
import { useActiveHeading } from "@/hooks/use-active-heading";
import { extractHeadings } from "@/lib/headings";
import { cn } from "@/lib/utils";
import { PlanHeader } from "./plan-header";
import { OutlinePanel } from "./outline-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MarkdownRenderer = lazy(() =>
  import("./markdown-renderer").then((m) => ({ default: m.MarkdownRenderer })),
);

function getInitialOutlineVisible(): boolean {
  const stored = localStorage.getItem("outline-visible");
  return stored === null ? true : stored === "true";
}

interface PlanViewerProps {
  sourceId: string;
  relativePath: string;
}

export function PlanViewer({ sourceId, relativePath }: PlanViewerProps) {
  const { data: plan, isLoading, error } = usePlanContent(sourceId, relativePath);
  const { isCompleted, toggleCompleted } = useCompletedPlans();
  const [outlineVisible, setOutlineVisible] = useState(getInitialOutlineVisible);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const headings = useMemo(() => (plan ? extractHeadings(plan.content) : []), [plan?.content]);
  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(headingIds, scrollContainerRef);

  const toggleOutline = useCallback((visible: boolean) => {
    setOutlineVisible(visible);
    localStorage.setItem("outline-visible", String(visible));
  }, []);

  const handleHeadingClick = useCallback((id: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const el = container.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !plan) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Failed to load plan: {relativePath}</p>
      </div>
    );
  }

  const showOutline = outlineVisible && headings.length > 0;

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
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <MarkdownRenderer content={plan.content} />
            </Suspense>
          </div>
        </div>
        {headings.length > 0 && (
          <>
            <div
              className={cn(
                "transition-[margin] duration-300 ease-in-out",
                showOutline ? "mr-0" : "-mr-56 xl:-mr-72 2xl:-mr-80",
              )}
            >
              <OutlinePanel
                headings={headings}
                activeId={activeId}
                onHeadingClick={handleHeadingClick}
                onClose={() => toggleOutline(false)}
              />
            </div>
            {!showOutline && (
              <Tooltip>
                <TooltipTrigger
                  onClick={() => toggleOutline(true)}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Show outline"
                >
                  <List className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>Show outline</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
}
