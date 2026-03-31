import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { FolderSource } from "@/types/plan";

interface FolderContextValue {
  sources: FolderSource[];
  isSupported: boolean;
  addFolder: () => Promise<void>;
  removeFolder: (id: string) => void;
}

const FolderContext = createContext<FolderContextValue | null>(null);

const isSupported = "showDirectoryPicker" in window;

const initialSources: FolderSource[] = import.meta.env.DEV ? [{ id: "api", label: "plans" }] : [];

export function FolderProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<FolderSource[]>(initialSources);

  const addFolder = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const id = `${handle.name}-${Date.now()}`;
      setSources((prev) => [...prev, { id, label: handle.name, handle }]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    }
  }, []);

  const removeFolder = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <FolderContext.Provider value={{ sources, isSupported, addFolder, removeFolder }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolderContext() {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error("useFolderContext must be used within FolderProvider");
  return ctx;
}
