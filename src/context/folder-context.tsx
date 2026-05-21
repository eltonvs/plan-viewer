import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { deleteFolder, listFolders, saveFolder } from "@/lib/folder-store";
import type { FolderSource } from "@/types/plan";

interface FolderContextValue {
  sources: FolderSource[];
  isSupported: boolean;
  addFolder: () => Promise<void>;
  removeFolder: (id: string) => void;
  reconnectFolder: (id: string) => Promise<void>;
  pendingReconnect: FolderSource[];
}

const FolderContext = createContext<FolderContextValue | null>(null);

const isSupported = "showDirectoryPicker" in window;

const initialSources: FolderSource[] = import.meta.env.DEV ? [{ id: "api", label: "plans" }] : [];

export function FolderProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<FolderSource[]>(initialSources);
  const [pendingReconnect, setPendingReconnect] = useState<FolderSource[]>([]);

  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    void listFolders().then(async (stored) => {
      if (cancelled) return;
      const granted: FolderSource[] = [];
      const pending: FolderSource[] = [];
      for (const entry of stored) {
        const perm = await entry.handle.queryPermission({ mode: "read" });
        const source: FolderSource = { id: entry.id, label: entry.label, handle: entry.handle };
        if (perm === "granted") granted.push(source);
        else pending.push(source);
      }
      if (cancelled) return;
      if (granted.length) setSources((prev) => [...prev, ...granted]);
      if (pending.length) setPendingReconnect(pending);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addFolder = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const id = `${handle.name}-${Date.now()}`;
      const source: FolderSource = { id, label: handle.name, handle };
      setSources((prev) => [...prev, source]);
      await saveFolder({ id, label: handle.name, handle });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    }
  }, []);

  const removeFolder = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setPendingReconnect((prev) => prev.filter((s) => s.id !== id));
    void deleteFolder(id);
  }, []);

  const reconnectFolder = useCallback(async (id: string) => {
    const entry = await listFolders().then((all) => all.find((e) => e.id === id));
    if (!entry) return;
    const perm = await entry.handle.requestPermission({ mode: "read" });
    if (perm !== "granted") return;
    setPendingReconnect((prev) => prev.filter((s) => s.id !== id));
    setSources((prev) => [...prev, { id: entry.id, label: entry.label, handle: entry.handle }]);
  }, []);

  return (
    <FolderContext.Provider
      value={{
        sources,
        isSupported,
        addFolder,
        removeFolder,
        reconnectFolder,
        pendingReconnect,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
}

export function useFolderContext() {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error("useFolderContext must be used within FolderProvider");
  return ctx;
}
