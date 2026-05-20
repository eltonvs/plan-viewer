export interface FolderSource {
  id: string;
  label: string;
  handle?: FileSystemDirectoryHandle;
}

export type PlanFileType = "md" | "html";

export interface PlanMeta {
  filename: string;
  relativePath: string;
  filePath: string;
  sourceId: string;
  title: string;
  modifiedAt: string;
  sizeBytes: number;
  fileType: PlanFileType;
}

export interface PlanDetail extends PlanMeta {
  content: string;
}
