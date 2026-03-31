import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "plan-viewer:completed";

function getCompletedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persist(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

let listeners: Array<() => void> = [];
let cached: Set<string> | null = null;

function getSnapshot(): Set<string> {
  if (!cached) cached = getCompletedSet();
  return cached;
}

function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function notify() {
  cached = getCompletedSet();
  listeners.forEach((l) => l());
}

export function useCompletedPlans() {
  const completed = useSyncExternalStore(subscribe, getSnapshot, () => new Set<string>());

  const toggleCompleted = useCallback((filePath: string) => {
    const current = getCompletedSet();
    if (current.has(filePath)) {
      current.delete(filePath);
    } else {
      current.add(filePath);
    }
    persist(current);
    notify();
  }, []);

  const isCompleted = useCallback((filePath: string) => completed.has(filePath), [completed]);

  return { toggleCompleted, isCompleted } as const;
}
