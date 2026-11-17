import { type ChipProps } from "@mui/material";
import {
  FILE_QUERY_PARAM,
  FIXED_BY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  PUBLISHING_STEP_LABEL,
} from "./constants";
import {
  type AtlasCheck,
  type AtlasIssue,
  type CurationFile,
  type CurationIssue,
  type CurationReport,
  type FileKind,
  type IssuePriority,
} from "./types";

/**
 * Merges the issues of every file into one entry per issue type and priority, most urgent first.
 * An issue type that files rate at different priorities gets one entry per priority, so each
 * entry's file count matches the files' own priority counts.
 * @param report - Curation report.
 * @param getIssues - Picks the issue list to merge from a file.
 * @returns Issue types with the files that have them.
 */
export function aggregateIssues(
  report: CurationReport,
  getIssues: (file: CurationFile) => CurationIssue[],
): AtlasIssue[] {
  const issuesByKey = new Map<string, AtlasIssue>();
  for (const file of report.files) {
    for (const issue of getIssues(file)) {
      const key = `${issue.id}-${issue.priority}`;
      const atlasIssue = issuesByKey.get(key);
      if (atlasIssue) {
        atlasIssue.files.push(file);
        if (atlasIssue.detail !== issue.detail) atlasIssue.detail = "";
      } else {
        issuesByKey.set(key, { ...issue, files: [file], key });
      }
    }
  }
  const issues = [...issuesByKey.values()];
  for (const issue of issues) {
    // The report's note, else the files' shared wording; empty when each file words it differently.
    issue.detail = report.issueNotes[issue.id] ?? issue.detail;
  }
  return issues.sort(
    (a, b) => a.priority - b.priority || b.files.length - a.files.length,
  );
}

/**
 * Merges the passed checks of every file.
 * @param report - Curation report.
 * @returns Passed checks with how many files passed them.
 */
export function aggregateChecks(report: CurationReport): AtlasCheck[] {
  const checksById = new Map<string, AtlasCheck>();
  for (const file of report.files) {
    for (const check of file.looksGood) {
      const atlasCheck = checksById.get(check.id);
      if (atlasCheck) atlasCheck.passedCount++;
      else checksById.set(check.id, { ...check, passedCount: 1 });
    }
  }
  return [...checksById.values()]
    .map((check) => ({
      ...check,
      detail:
        report.goodNotes[check.id] ??
        `Passed on ${check.passedCount} of ${report.files.length} files.`,
    }))
    .sort((a, b) => b.passedCount - a.passedCount);
}

/**
 * Groups items by their category, keeping the first-seen category order.
 * @param items - Items with a category.
 * @returns Category and items pairs.
 */
export function groupByCategory<T extends { category: string }>(
  items: T[],
): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups.entries()];
}

/**
 * Returns the files of the given kind.
 * @param files - Files.
 * @param kind - File kind.
 * @returns Files of that kind.
 */
export function filterByKind(
  files: CurationFile[],
  kind: FileKind,
): CurationFile[] {
  return files.filter((file) => file.kind === kind);
}

/**
 * Builds the URL of a file's page in the curation report.
 * @param statusUrl - URL of the atlas status page.
 * @param fileStem - File stem.
 * @returns File page URL.
 */
export function getFileUrl(statusUrl: string, fileStem: string): string {
  return `${statusUrl}?${FILE_QUERY_PARAM}=${encodeURIComponent(fileStem)}`;
}

/**
 * Counts a file's issues of one priority.
 * @param file - File.
 * @param priority - Issue priority.
 * @returns Number of issues.
 */
export function countPriority(
  file: CurationFile,
  priority: IssuePriority,
): number {
  return file.needsWork.filter((issue) => issue.priority === priority).length;
}

/**
 * Chip colour and label for an issue's priority; publishing steps get their own.
 * @param issue - Issue type or publishing step.
 * @returns Chip colour and label.
 */
export function getPriorityChip(issue: AtlasIssue): {
  color: ChipProps["color"];
  label: string;
} {
  return issue.isPublishingStep
    ? getPublishingStepChip()
    : {
        color: PRIORITY_COLOR[issue.priority],
        label: PRIORITY_LABEL[issue.priority],
      };
}

/**
 * Chip colour and label for a publishing step.
 * @returns Chip colour and label.
 */
export function getPublishingStepChip(): {
  color: ChipProps["color"];
  label: string;
} {
  return { color: "default", label: PUBLISHING_STEP_LABEL };
}

/**
 * Display name of who fixes an issue.
 * @param who - Who fixes it, as in the report.
 * @returns Display name.
 */
export function getFixedByLabel(who: string): string {
  return FIXED_BY_LABEL[who] ?? who;
}

/**
 * Chip label naming who fixes an issue.
 * @param who - Who fixes it, as in the report.
 * @returns Owner label.
 */
export function getOwnerLabel(who: string): string {
  return `Owner: ${getFixedByLabel(who)}`;
}
