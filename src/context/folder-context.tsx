import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface FolderContextValue {
  handle: FileSystemDirectoryHandle | null;
  folderName: string | null;
  isSupported: boolean;
  openFolder: () => Promise<void>;
  closeFolder: () => void;
}

const FolderContext = createContext<FolderContextValue | null>(null);

const isSupported = "showDirectoryPicker" in window;

export function FolderProvider({ children }: { children: ReactNode }) {
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const openFolder = useCallback(async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      setHandle(dirHandle);
    } catch (err) {
      // User cancelled the picker
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    }
  }, []);

  const closeFolder = useCallback(() => setHandle(null), []);

  return (
    <FolderContext.Provider
      value={{
        handle,
        folderName: handle?.name ?? null,
        isSupported,
        openFolder,
        closeFolder,
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
