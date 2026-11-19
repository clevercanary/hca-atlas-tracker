export const PRIORITY = {
  HIGH: 1,
  LOW: 3,
  MEDIUM: 2,
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const OWNER = {
  CURATION_TOOL: "curation tool",
  PRODUCER: "producer",
  WRANGLER: "wrangler",
} as const;

export type Owner = (typeof OWNER)[keyof typeof OWNER];

export const FILE_KIND = {
  INTEGRATED_OBJECT: "integrated_object",
  SOURCE_DATASET: "source_dataset",
} as const;

export type FileKind = (typeof FILE_KIND)[keyof typeof FILE_KIND];

export const VERDICT = {
  NEEDS_WORK: "needs work",
  NOT_STARTED: "not started",
  READY: "ready",
} as const;

export type Verdict = (typeof VERDICT)[keyof typeof VERDICT];

export interface ReportIssue {
  category: string;
  detail: string;
  evidence: string | null;
  id: string;
  owner: Owner;
  priority: Priority;
  title: string;
  tool: string | null;
}

export interface ReportPassedCheck {
  detail: string;
  id: string;
}

export interface ValidatorSummary {
  errors: number;
  valid: boolean;
  warnings: number;
}

export interface FileFacts {
  capStatus: string;
  cellAnnotationValidator: ValidatorSummary | null;
  donors: number | null;
  genes: number;
  hasRawX: boolean;
  libraries: number | null;
  samples: number | null;
  schemaValidator: ValidatorSummary | null;
  size: string;
  title: string | null;
  trackerRevision: string;
  xState: string;
}

export interface GeneItem {
  detail: string;
  owner: Owner;
  priority: Priority;
  title: string;
}

export interface FileGenes {
  byClass: Record<string, number>;
  items: GeneItem[];
  notInGencode: number;
  summary: string;
}

export interface SourceComparison {
  cells: number;
  claimedTwice: number;
  compared: number;
  differences: string;
  unaccounted: number;
}

export interface ReportFile {
  cells: number;
  displayName: string;
  facts: FileFacts;
  fileStem: string;
  genes: FileGenes;
  kind: FileKind;
  looksGood: ReportPassedCheck[];
  needsWork: ReportIssue[];
  sourceComparison: SourceComparison | null;
  verdict: Verdict;
  verdictReason: string;
}

export interface ReportCheck {
  note: string;
  title: string;
}

export interface CurationReport {
  atlasTitle: string;
  checks: Record<string, ReportCheck>;
  files: ReportFile[];
  generation: number;
  issueNotes: Record<string, string>;
  lede: string;
  reportDate: string;
}

export interface SharedIssueFile {
  displayName: string;
  fileStem: string;
}

export interface SharedIssue {
  files: SharedIssueFile[];
  id: string;
  note: string;
  owner: Owner;
  priority: Priority;
  title: string;
  tool: string | null;
}

export interface ClearedCheck {
  id: string;
  passed: number;
  title: string;
}

export interface IssueCounts {
  byOwner: Record<Owner, number>;
  byPriority: Record<Priority, number>;
  total: number;
}

export interface FileRow {
  cells: number;
  displayName: string;
  fileStem: string;
  kind: FileKind;
  priorities: Record<Priority, number>;
  verdict: Verdict;
}

export interface Props {
  fileStem?: string;
  getFileHref: (fileStem?: string) => string;
  report: CurationReport;
}
