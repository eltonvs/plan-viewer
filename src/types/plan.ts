export interface FolderSource {
  id: string;
  label: string;
  handle?: FileSystemDirectoryHandle;
}

export interface PlanMeta {
  filename: string;
  relativePath: string;
  filePath: string;
  sourceId: string;
  title: string;
  modifiedAt: string;
  sizeBytes: number;
}

export interface PlanDetail extends PlanMeta {
  content: string;
}
