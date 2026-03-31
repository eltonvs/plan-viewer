import type { PlanDetail, PlanMeta } from "@/types/plan";

declare global {
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
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

export async function walkDirectory(
  handle: FileSystemDirectoryHandle,
  sourceId: string,
  prefix: string = "",
): Promise<PlanMeta[]> {
  const plans: PlanMeta[] = [];

  for await (const entry of handle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".md")) {
      const file = await (entry as FileSystemFileHandle).getFile();
      const content = await file.text();
      const relativePath = prefix + entry.name;
      plans.push({
        filename: entry.name,
        relativePath,
        filePath: `${sourceId}/${relativePath}`,
        sourceId,
        title: extractTitle(content, entry.name),
        modifiedAt: new Date(file.lastModified).toISOString(),
        sizeBytes: file.size,
      });
    } else if (entry.kind === "directory") {
      const subHandle = entry as FileSystemDirectoryHandle;
      plans.push(...(await walkDirectory(subHandle, sourceId, `${prefix}${entry.name}/`)));
    }
  }

  plans.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  return plans;
}

async function getFileByRelativePath(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemFileHandle> {
  const parts = relativePath.split("/");
  const fileName = parts.pop()!;
  let dir = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }
  return dir.getFileHandle(fileName);
}

export async function readPlanFromHandle(
  handle: FileSystemDirectoryHandle,
  sourceId: string,
  relativePath: string,
): Promise<PlanDetail> {
  const fileHandle = await getFileByRelativePath(handle, relativePath);
  const file = await fileHandle.getFile();
  const content = await file.text();
  const filename = relativePath.split("/").pop()!;

  return {
    filename,
    relativePath,
    filePath: `${sourceId}/${relativePath}`,
    sourceId,
    title: extractTitle(content, filename),
    content,
    modifiedAt: new Date(file.lastModified).toISOString(),
    sizeBytes: file.size,
  };
}
