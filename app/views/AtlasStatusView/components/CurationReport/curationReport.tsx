import { AlertTitle } from "@mui/material";
import { type JSX, useMemo } from "react";
import { ClearedChecks } from "./components/ClearedChecks/clearedChecks";
import { FileDetail } from "./components/FileDetail/fileDetail";
import { FilesTable } from "./components/FilesTable/filesTable";
import { MetricTiles } from "./components/MetricTiles/metricTiles";
import { ReportSummary } from "./components/ReportSummary/reportSummary";
import { SharedIssues } from "./components/SharedIssues/sharedIssues";
import { ALERT_PROPS } from "./constants";
import { StyledAlert, StyledReport } from "./curationReport.styles";
import { type Props } from "./types";
import {
  getClearedChecks,
  getFileRows,
  getIssueCounts,
  getSharedIssues,
  getVerdictCounts,
} from "./utils";

export const CurationReport = ({
  fileStem,
  getFileHref,
  report,
}: Props): JSX.Element => {
  const sharedIssues = useMemo(() => getSharedIssues(report), [report]);
  const clearedChecks = useMemo(() => getClearedChecks(report), [report]);
  const issueCounts = useMemo(() => getIssueCounts(report.files), [report]);
  const verdictCounts = useMemo(() => getVerdictCounts(report.files), [report]);
  const fileRows = useMemo(() => getFileRows(report.files), [report]);
  const file = report.files.find((f) => f.fileStem === fileStem);

  if (file) {
    return <FileDetail backHref={getFileHref()} file={file} report={report} />;
  }

  return (
    <StyledReport>
      <StyledAlert {...ALERT_PROPS}>
        <AlertTitle>Prototype</AlertTitle>
        This tab shows sample data from the Heart v1 evaluation of 2026-11-14,
        whichever atlas is open.
      </StyledAlert>
      <ReportSummary report={report} verdictCounts={verdictCounts} />
      <MetricTiles
        clearedChecks={clearedChecks}
        fileCount={report.files.length}
        issueCounts={issueCounts}
        verdictCounts={verdictCounts}
      />
      <SharedIssues getFileHref={getFileHref} sharedIssues={sharedIssues} />
      <ClearedChecks
        clearedChecks={clearedChecks}
        fileCount={report.files.length}
      />
      <FilesTable fileRows={fileRows} getFileHref={getFileHref} />
    </StyledReport>
  );
};
