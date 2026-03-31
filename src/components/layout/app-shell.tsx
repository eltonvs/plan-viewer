import { useState, useCallback } from "react";
import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeSidebar} />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar onPlanSelect={closeSidebar} />
      </div>

      <main className="flex-1 overflow-hidden">
        {!sidebarOpen && (
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading text-sm font-semibold">Plan Viewer</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
