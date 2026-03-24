import { Badge } from "@/components/ui/badge";

interface PlanHeaderProps {
  title: string;
  filename: string;
  modifiedAt: string;
  sizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PlanHeader({ title, filename, modifiedAt, sizeBytes }: PlanHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="min-w-0">
        <h1 className="truncate font-heading text-lg font-semibold">{title}</h1>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{filename}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          {formatBytes(sizeBytes)}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(modifiedAt)}</span>
      </div>
    </div>
  );
}
