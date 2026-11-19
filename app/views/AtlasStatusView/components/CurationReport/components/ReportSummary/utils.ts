import {
  type AtlasIssue,
  ISSUE_PRIORITY,
  type IssuePriority,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";

/**
 * Issue types by priority, e.g. "23 blocking, 7 should fix, 13 to check".
 * @param issues - Issue types.
 * @returns Breakdown text.
 */
export function getIssueBreakdown(issues: AtlasIssue[]): string {
  const count = (priority: IssuePriority): number =>
    issues.filter((issue) => issue.priority === priority).length;
  return [
    `${count(ISSUE_PRIORITY.BLOCKS)} blocking`,
    `${count(ISSUE_PRIORITY.SHOULD_FIX)} should fix`,
    `${count(ISSUE_PRIORITY.CHECK)} to check`,
  ].join(", ");
}
