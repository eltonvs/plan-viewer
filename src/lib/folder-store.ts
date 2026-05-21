const DB_NAME = "plan-viewer";
const DB_VERSION = 1;
const STORE = "folder-handles";

interface StoredFolder {
  id: string;
  label: string;
  handle: FileSystemDirectoryHandle;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export function saveFolder(entry: StoredFolder): Promise<unknown> {
  return tx("readwrite", (s) => s.put(entry));
}

export function deleteFolder(id: string): Promise<unknown> {
  return tx("readwrite", (s) => s.delete(id));
}

export function listFolders(): Promise<StoredFolder[]> {
  return tx<StoredFolder[]>("readonly", (s) => s.getAll());
}
