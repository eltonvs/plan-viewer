export interface PlanMeta {
  filename: string;
  title: string;
  modifiedAt: string;
  sizeBytes: number;
}

export interface PlanDetail extends PlanMeta {
  filePath: string;
  content: string;
}
