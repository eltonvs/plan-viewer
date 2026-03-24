import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <FileText className="h-16 w-16 stroke-1" />
      <div className="text-center">
        <p className="text-lg font-medium">Select a plan to view</p>
        <p className="mt-1 text-sm">Choose a plan from the sidebar to see its contents</p>
      </div>
    </div>
  );
}
