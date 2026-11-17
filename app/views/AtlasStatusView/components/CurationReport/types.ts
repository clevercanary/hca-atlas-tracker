export const FILE_KIND = {
  INTEGRATED_OBJECT: "integrated_object",
  SOURCE_DATASET: "source_dataset",
} as const;

export type FileKind = (typeof FILE_KIND)[keyof typeof FILE_KIND];

export const ISSUE_PRIORITY = {
  BLOCKS: 1,
  CHECK: 3,
  SHOULD_FIX: 2,
} as const;

export type IssuePriority =
  (typeof ISSUE_PRIORITY)[keyof typeof ISSUE_PRIORITY];

export const VERDICT = {
  NEEDS_WORK: "needs work",
  NOT_STARTED: "not started",
  PUBLISHING_STEPS: "publishing steps",
  READY: "ready",
} as const;

export type Verdict = (typeof VERDICT)[keyof typeof VERDICT];

export interface CurationIssue {
  category: string;
  detail: string;
  evidence: string | null;
  id: string;
  priority: IssuePriority;
  title: string;
  tool: string | null;
  who: string | null;
}

export interface CurationCheck {
  category: string;
  detail: string;
  id: string;
  title: string;
}

export interface CurationFile {
  displayName: string;
  fileStem: string;
  kind: FileKind;
  looksGood: CurationCheck[];
  needsWork: CurationIssue[];
  publishingSteps: CurationIssue[];
  verdict: Verdict;
  verdictReason: string | null;
}

export interface CurationReport {
  atlasTitle: string;
  files: CurationFile[];
  goodNotes: Record<string, string>;
  issueNotes: Record<string, string>;
  lede: string | null;
  reportDate: string;
}

export interface CurationReportProps {
  report: CurationReport;
  statusUrl: string;
}

export interface AtlasIssue extends CurationIssue {
  /** Every file with the issue, before the File and Kind filters narrow `files`. */
  allFiles?: CurationFile[];
  files: CurationFile[];
  isPublishingStep?: boolean;
  /** Row key: one row per issue type and priority. */
  key: string;
}

export interface AtlasCheck extends CurationCheck {
  passedCount: number;
}
