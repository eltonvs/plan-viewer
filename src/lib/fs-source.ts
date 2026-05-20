import { extractTitleFromContent, extractTitleFromHtml, stripFrontmatter } from "@/lib/frontmatter";
import { fileTypeFromName } from "@/lib/plan-file-type";
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

export async function walkDirectory(
  handle: FileSystemDirectoryHandle,
  sourceId: string,
  prefix: string = "",
): Promise<PlanMeta[]> {
  const plans: PlanMeta[] = [];

  for await (const entry of handle.values()) {
    const fileType = entry.kind === "file" ? fileTypeFromName(entry.name) : null;
    if (entry.kind === "file" && fileType) {
      const file = await (entry as FileSystemFileHandle).getFile();
      const content = await file.text();
      const relativePath = prefix + entry.name;
      plans.push({
        filename: entry.name,
        relativePath,
        filePath: `${sourceId}/${relativePath}`,
        sourceId,
        title:
          fileType === "html"
            ? extractTitleFromHtml(content, entry.name)
            : extractTitleFromContent(content, entry.name),
        modifiedAt: new Date(file.lastModified).toISOString(),
        sizeBytes: file.size,
        fileType,
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
  const fileType = fileTypeFromName(filename);
  if (!fileType) throw new Error(`Unsupported plan file: ${filename}`);
  const isHtml = fileType === "html";

  return {
    filename,
    relativePath,
    filePath: `${sourceId}/${relativePath}`,
    sourceId,
    title: isHtml
      ? extractTitleFromHtml(content, filename)
      : extractTitleFromContent(content, filename),
    content: isHtml ? content : stripFrontmatter(content),
    modifiedAt: new Date(file.lastModified).toISOString(),
    sizeBytes: file.size,
    fileType,
  };
}
