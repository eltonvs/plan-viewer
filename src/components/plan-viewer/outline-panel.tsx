import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/lib/headings";

const levelPadding: Record<number, string> = {
  1: "pl-0",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
  5: "pl-12",
  6: "pl-15",
};

interface OutlinePanelProps {
  headings: HeadingItem[];
  activeId: string | null;
  onHeadingClick: (id: string) => void;
  onClose: () => void;
}

export function OutlinePanel({ headings, activeId, onHeadingClick, onClose }: OutlinePanelProps) {
  return (
    <div className="flex w-56 shrink-0 flex-col border-l border-border">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Outline
        </span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close outline"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => onHeadingClick(heading.id)}
                className={cn(
                  "w-full truncate rounded-md px-2 py-1 text-left text-sm transition-colors",
                  levelPadding[heading.level] ?? "pl-0",
                  activeId === heading.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={heading.text}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
