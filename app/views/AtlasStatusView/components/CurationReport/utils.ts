import {
  type ClearedCheck,
  type CurationReport,
  type FileRow,
  type IssueCounts,
  type Owner,
  OWNER,
  type Priority,
  PRIORITY,
  type ReportFile,
  type ReportIssue,
  type SharedIssue,
  type ValidatorSummary,
  VERDICT,
  type Verdict,
} from "./types";

/**
 * Collapses each issue id across files into one entry, listing each affected
 * file once, ordered by priority, then by the number of files it affects.
 * @param report - Curation report.
 * @returns shared issues, most urgent and widespread first.
 */
export function getSharedIssues(report: CurationReport): SharedIssue[] {
  const byId = new Map<string, SharedIssue>();
  for (const file of report.files) {
    const affected = { displayName: file.displayName, fileStem: file.fileStem };
    for (const issue of file.needsWork) {
      const shared = byId.get(issue.id);
      if (shared) {
        if (shared.files.at(-1)?.fileStem !== file.fileStem) {
          shared.files.push(affected);
        }
        shared.priority = Math.min(shared.priority, issue.priority) as Priority;
      } else {
        byId.set(issue.id, {
          files: [affected],
          id: issue.id,
          note: report.issueNotes[issue.id] ?? issue.detail,
          owner: issue.owner,
          priority: issue.priority,
          title: issue.title,
          tool: issue.tool,
        });
      }
    }
  }
  return [...byId.values()].sort(
    (a, b) => a.priority - b.priority || b.files.length - a.files.length,
  );
}

/**
 * Counts every open issue in the report by priority and by owner.
 * @param files - Report files.
 * @returns issue counts.
 */
export function getIssueCounts(files: ReportFile[]): IssueCounts {
  const counts: IssueCounts = {
    byOwner: {
      [OWNER.CURATION_TOOL]: 0,
      [OWNER.PRODUCER]: 0,
      [OWNER.WRANGLER]: 0,
    },
    byPriority: { [PRIORITY.HIGH]: 0, [PRIORITY.MEDIUM]: 0, [PRIORITY.LOW]: 0 },
    total: 0,
  };
  for (const file of files) {
    for (const issue of file.needsWork) {
      counts.byOwner[issue.owner] += 1;
      counts.byPriority[issue.priority] += 1;
      counts.total += 1;
    }
  }
  return counts;
}

/**
 * Counts, for each passed check, the files that passed it.
 * @param report - Curation report.
 * @returns cleared checks, most widely passed first.
 */
export function getClearedChecks(report: CurationReport): ClearedCheck[] {
  const passed = new Map<string, number>();
  for (const file of report.files) {
    for (const { id } of file.looksGood) {
      passed.set(id, (passed.get(id) ?? 0) + 1);
    }
  }
  return [...passed.entries()]
    .map(([id, count]) => ({
      id,
      passed: count,
      title: report.checks[id].title,
    }))
    .sort((a, b) => b.passed - a.passed || a.title.localeCompare(b.title));
}

/**
 * Counts the report's files by verdict.
 * @param files - Report files.
 * @returns file count per verdict.
 */
export function getVerdictCounts(files: ReportFile[]): Record<Verdict, number> {
  const counts: Record<Verdict, number> = {
    [VERDICT.NEEDS_WORK]: 0,
    [VERDICT.NOT_STARTED]: 0,
    [VERDICT.READY]: 0,
  };
  for (const file of files) counts[file.verdict] += 1;
  return counts;
}

/**
 * Builds one table row per file, with its open issues counted by priority.
 * @param files - Report files.
 * @returns file rows, in report order.
 */
export function getFileRows(files: ReportFile[]): FileRow[] {
  return files.map((file) => {
    const priorities: Record<Priority, number> = {
      [PRIORITY.HIGH]: 0,
      [PRIORITY.MEDIUM]: 0,
      [PRIORITY.LOW]: 0,
    };
    for (const issue of file.needsWork) priorities[issue.priority] += 1;
    return {
      cells: file.cells,
      displayName: file.displayName,
      fileStem: file.fileStem,
      kind: file.kind,
      priorities,
      verdict: file.verdict,
    };
  });
}

/**
 * Groups one file's issues by priority, most urgent first, leaving out
 * priorities with no issues.
 * @param file - Report file.
 * @returns priority and issue pairs.
 */
export function getIssuesByPriority(
  file: ReportFile,
): [Priority, ReportIssue[]][] {
  return [PRIORITY.HIGH, PRIORITY.MEDIUM, PRIORITY.LOW]
    .map((priority): [Priority, ReportIssue[]] => [
      priority,
      file.needsWork.filter((issue) => issue.priority === priority),
    ])
    .filter(([, issues]) => issues.length > 0);
}

/**
 * Describes a validator's result in one line.
 * @param summary - Validator summary, or null when the validator did not run.
 * @returns result text.
 */
export function describeValidator(summary: ValidatorSummary | null): string {
  if (!summary) return "Not run";
  const counts = `${summary.errors} errors, ${summary.warnings} warnings`;
  return `${summary.valid ? "Valid" : "Invalid"} · ${counts}`;
}

/**
 * Formats a count the evaluation may not have been able to take.
 * @param count - Count, or null when the file does not record it.
 * @returns the count, or "Not recorded".
 */
export function formatCount(count: number | null): string {
  return count === null ? "Not recorded" : count.toLocaleString("en-US");
}

/**
 * Orders owners by how many issues they hold, largest first.
 * @param byOwner - Issue count per owner.
 * @returns owner and count pairs.
 */
export function getOwnersByCount(
  byOwner: Record<Owner, number>,
): [Owner, number][] {
  return (Object.entries(byOwner) as [Owner, number][]).sort(
    (a, b) => b[1] - a[1],
  );
}
