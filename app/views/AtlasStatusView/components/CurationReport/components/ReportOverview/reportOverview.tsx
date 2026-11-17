import { ChecksTable } from "@/app/views/AtlasStatusView/components/CurationReport/components/ChecksTable/checksTable";
import { CHECK_COLUMNS } from "@/app/views/AtlasStatusView/components/CurationReport/components/ChecksTable/constants";
import {
  FILE_COLUMN_ID,
  getFileColumns,
  VERDICT_ORDER,
} from "@/app/views/AtlasStatusView/components/CurationReport/components/FilesTable/constants";
import { FilesTable } from "@/app/views/AtlasStatusView/components/CurationReport/components/FilesTable/filesTable";
import { IssueTable } from "@/app/views/AtlasStatusView/components/CurationReport/components/IssueTable/issueTable";
import { ReportFilters } from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportFilters/reportFilters";
import { ReportSummary } from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportSummary/reportSummary";
import { TableCard } from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard";
import { ViewTabs } from "@/app/views/AtlasStatusView/components/CurationReport/components/ViewTabs/viewTabs";
import {
  FILE_KIND_PLURAL_LABEL,
  PRIORITY_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { useFilterTable } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/hook";
import { getFilteredRows } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/utils";
import { COLUMN_ID as ISSUE_COLUMN_ID } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseIssueFilters/constants";
import { useIssueFilters } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseIssueFilters/hook";
import {
  type AtlasCheck,
  type AtlasIssue,
  type CurationFile,
  FILE_KIND,
  type FileKind,
  ISSUE_PRIORITY,
  type IssuePriority,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  aggregateChecks,
  aggregateIssues,
  countPriority,
  filterByKind,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { ColumnFilterTags } from "@databiosphere/findable-ui/lib/components/DataDictionary/components/Filters/components/ColumnFilterTags/columnFilterTags";
import { type RowData, type Table } from "@tanstack/react-table";
import { type JSX, type ReactNode, useMemo } from "react";
import { VIEW } from "./constants";
import { StyledFilters } from "./reportOverview.styles";
import { type Props } from "./types";

interface TableControls {
  filterControls: ReactNode;
  filterTags: ReactNode;
}

interface ViewContent extends TableControls {
  table: ReactNode;
}

export const ReportOverview = ({
  report,
  state,
  statusUrl,
}: Props): JSX.Element => {
  const { filters, onFiltersChange, showView, view } = state;

  // Atlas-team issues first, then our own publishing steps, in one list.
  const rows = useMemo(
    () => [
      ...aggregateIssues(report, (file) => file.needsWork),
      ...aggregateIssues(report, (file) => file.publishingSteps).map(
        (step) => ({
          ...step,
          isPublishingStep: true,
          key: `step-${step.key}`,
        }),
      ),
    ],
    [report],
  );
  const {
    fileNames,
    kindLabels,
    table: issueTable,
  } = useIssueFilters(rows, filters[VIEW.ISSUES], onFiltersChange(VIEW.ISSUES));
  // The File and Kind filters also narrow each issue's own file list.
  const issueRows = getFilteredRows(issueTable).map((original) => ({
    ...original,
    allFiles: original.files,
    files: original.files.filter(
      (file) =>
        (!kindLabels.length ||
          kindLabels.includes(FILE_KIND_PLURAL_LABEL[file.kind])) &&
        (!fileNames.length || fileNames.includes(file.displayName)),
    ),
  }));

  const files = useMemo(
    () =>
      [...report.files].sort(
        (a, b) =>
          VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict) ||
          countPriority(b, ISSUE_PRIORITY.BLOCKS) -
            countPriority(a, ISSUE_PRIORITY.BLOCKS),
      ),
    [report],
  );
  const checks = useMemo(() => aggregateChecks(report), [report]);
  const fileColumns = useMemo(() => getFileColumns(checks), [checks]);
  const fileTable = useFilterTable(
    files,
    fileColumns,
    (file) => file.fileStem,
    filters[VIEW.FILES],
    onFiltersChange(VIEW.FILES),
  );
  const fileRows = getFilteredRows(fileTable);

  const checkTable = useFilterTable(
    checks,
    CHECK_COLUMNS,
    (check) => check.id,
    filters[VIEW.CHECKS],
    onFiltersChange(VIEW.CHECKS),
  );
  const checkRows = getFilteredRows(checkTable);

  const kindTotals: Record<FileKind, number> = {
    [FILE_KIND.INTEGRATED_OBJECT]: filterByKind(
      report.files,
      FILE_KIND.INTEGRATED_OBJECT,
    ).length,
    [FILE_KIND.SOURCE_DATASET]: filterByKind(
      report.files,
      FILE_KIND.SOURCE_DATASET,
    ).length,
  };

  // A file's issue count opens the Issues view, filtered to that file and priority.
  const openFileIssues = (file: CurationFile, priority: IssuePriority): void =>
    showView(VIEW.ISSUES, [
      { id: ISSUE_COLUMN_ID.FILE, value: [file.displayName] },
      { id: ISSUE_COLUMN_ID.PRIORITY, value: [PRIORITY_LABEL[priority]] },
    ]);

  // An issue's file count opens the Files view, filtered to that issue and
  // kind, and to the files the Issues view was narrowed to, if any.
  const openIssueFiles = (issue: AtlasIssue, kind: FileKind): void =>
    showView(VIEW.FILES, [
      { id: FILE_COLUMN_ID.ISSUE, value: [issue.title] },
      { id: FILE_COLUMN_ID.KIND, value: [FILE_KIND_PLURAL_LABEL[kind]] },
      ...(fileNames.length
        ? [{ id: FILE_COLUMN_ID.FILE, value: fileNames }]
        : []),
    ]);

  // A check's failed count opens the Files view, filtered to the files that failed it.
  const openFailedFiles = (check: AtlasCheck): void =>
    showView(VIEW.FILES, [
      { id: FILE_COLUMN_ID.FAILED_CHECK, value: [check.title] },
    ]);

  const getViewContent = (): ViewContent => {
    switch (view) {
      case VIEW.CHECKS:
        return {
          ...getTableControls(checkTable),
          table: (
            <ChecksTable
              checks={checkRows}
              fileCount={report.files.length}
              onFailedClick={openFailedFiles}
            />
          ),
        };
      case VIEW.FILES:
        return {
          ...getTableControls(fileTable),
          table: (
            <FilesTable
              files={fileRows}
              onCountClick={openFileIssues}
              statusUrl={statusUrl}
            />
          ),
        };
      case VIEW.ISSUES:
        return {
          ...getTableControls(issueTable),
          table: (
            <IssueTable
              issues={issueRows}
              kindTotals={kindTotals}
              onCountClick={openIssueFiles}
              statusUrl={statusUrl}
            />
          ),
        };
    }
  };
  const { filterControls, filterTags, table } = getViewContent();

  return (
    <>
      <ReportSummary
        issues={rows.filter((row) => !row.isPublishingStep)}
        publishingStepCount={rows.filter((row) => row.isPublishingStep).length}
        report={report}
      />
      <TableCard
        filterTags={filterTags}
        toolbar={
          <>
            <ViewTabs
              onChange={(next): void => showView(next)}
              options={[
                {
                  count: issueRows.length,
                  label: "Issues",
                  value: VIEW.ISSUES,
                },
                { count: fileRows.length, label: "Files", value: VIEW.FILES },
                {
                  count: checkRows.length,
                  label: "Checks",
                  value: VIEW.CHECKS,
                },
              ]}
              value={view}
            />
            <StyledFilters>{filterControls}</StyledFilters>
          </>
        }
      >
        {table}
      </TableCard>
    </>
  );
};

/**
 * Filter buttons and active filter tags for a view's table.
 * @param table - The view's table.
 * @returns Filter controls and tags.
 */
function getTableControls<T extends RowData>(table: Table<T>): TableControls {
  return {
    filterControls: <ReportFilters table={table} />,
    filterTags: table.getState().columnFilters.length > 0 && (
      <ColumnFilterTags table={table} />
    ),
  };
}
