import { FileText, FolderOpen, Star } from "lucide-react";

import { GithubIcon } from "@/components/common/github-icon";
import { useFolderContext } from "@/context/folder-context";

export function EmptyState() {
  const { isSupported, sources, addFolder } = useFolderContext();
  const hasSources = sources.length > 0;

  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-4 px-6">
      <FileText className="h-16 w-16 stroke-1" aria-hidden="true" />
      <div className="text-center">
        {hasSources ? (
          <>
            <p className="text-lg font-medium">Select a plan to view</p>
            <p className="mt-1 text-sm">Choose a plan from the sidebar to see its contents</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">Get started</p>
            <p className="mt-1 text-sm">
              Open a folder containing your markdown plan files to start browsing
            </p>
          </>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {isSupported && (
          <button
            type="button"
            onClick={() => void addFolder()}
            className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Open Folder
          </button>
        )}
        <a
          href="https://github.com/eltonvs/plan-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
        >
          <GithubIcon className="h-4 w-4" />
          <Star className="h-3.5 w-3.5" />
          Star on GitHub
        </a>
      </div>
    </div>
  );
}
