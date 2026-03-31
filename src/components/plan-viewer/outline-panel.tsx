import type { ReactNode } from "react";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/lib/headings";

function renderInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const m = match[0];
    if (m.startsWith("`")) {
      parts.push(
        <code key={match.index} className="break-all rounded bg-muted px-1 py-0.5 font-mono text-xs">
          {m.slice(1, -1)}
        </code>,
      );
    } else if (m.startsWith("**")) {
      parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    }
    last = match.index + m.length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

const levelPadding: Record<number, string> = {
  1: "pl-1",
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
    <div className="flex w-56 shrink-0 flex-col border-l border-border xl:w-72 2xl:w-80">
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
      <nav className="flex-1 overflow-y-auto px-2 pt-1 pb-4">
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => onHeadingClick(heading.id)}
                className={cn(
                  "w-full rounded-md px-2 py-1 text-left text-sm leading-snug transition-colors",
                  levelPadding[heading.level] ?? "pl-0",
                  activeId === heading.id
                    ? "border-l-2 border-primary bg-primary/10 text-primary"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={heading.text}
              >
                {renderInlineMarkdown(heading.text)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
