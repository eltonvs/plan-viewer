import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";

import { Sidebar } from "./sidebar";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
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
          <div className="border-border flex items-center gap-2 border-b px-3 py-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
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
