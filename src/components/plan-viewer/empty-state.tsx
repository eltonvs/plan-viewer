import { FileText, FolderOpen, Star } from "lucide-react";
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
      <div className="mt-2 flex items-center gap-3">
        {isSupported && (
          <button
            type="button"
            onClick={() => void addFolder()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <FolderOpen className="h-4 w-4" />
            Open Folder
          </button>
        )}
        <a
          href="https://github.com/eltonvs/plan-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <Star className="h-3.5 w-3.5" />
          Star on GitHub
        </a>
      </div>
    </div>
  );
}
