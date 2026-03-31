import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface PlanSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlanSearch({ value, onChange }: PlanSearchProps) {
  return (
    <div className="relative">
      <Search
        className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        aria-label="Search plans"
        placeholder="Search plans…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8 pl-9"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
