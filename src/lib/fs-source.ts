import type { PlanDetail, PlanMeta } from "@/types/plan";

declare global {
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
  }
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

function extractTitle(content: string, filename: string): string {
  const firstLine = content.split("\n").find((line) => line.startsWith("# "));
  if (firstLine) return firstLine.replace(/^#\s+/, "");
  return filename.replace(/\.md$/, "").replace(/-/g, " ");
}

export async function readPlansFromHandle(handle: FileSystemDirectoryHandle): Promise<PlanMeta[]> {
  const plans: PlanMeta[] = [];

  for await (const entry of handle.values()) {
    if (entry.kind !== "file" || !entry.name.endsWith(".md")) continue;
    const file = await (entry as FileSystemFileHandle).getFile();
    const content = await file.text();
    plans.push({
      filename: entry.name,
      filePath: `${handle.name}/${entry.name}`,
      title: extractTitle(content, entry.name),
      modifiedAt: new Date(file.lastModified).toISOString(),
      sizeBytes: file.size,
    });
  }

  plans.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  return plans;
}

export async function readPlanFromHandle(
  handle: FileSystemDirectoryHandle,
  filename: string,
): Promise<PlanDetail> {
  const fileHandle = await handle.getFileHandle(filename);
  const file = await fileHandle.getFile();
  const content = await file.text();

  return {
    filename,
    filePath: `${handle.name}/${filename}`,
    title: extractTitle(content, filename),
    content,
    modifiedAt: new Date(file.lastModified).toISOString(),
    sizeBytes: file.size,
  };
}
