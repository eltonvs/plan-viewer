import { FileText, FolderOpen } from "lucide-react";
import { useFolderContext } from "@/context/folder-context";

export function EmptyState() {
  const { isSupported, addFolder } = useFolderContext();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <FileText className="h-16 w-16 stroke-1" />
      <div className="text-center">
        <p className="text-lg font-medium">Select a plan to view</p>
        <p className="mt-1 text-sm">Choose a plan from the sidebar to see its contents</p>
      </div>
      {isSupported && (
        <button
          type="button"
          onClick={() => void addFolder()}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <FolderOpen className="h-4 w-4" />
          Open Folder
        </button>
      )}
    </div>
  );
}
