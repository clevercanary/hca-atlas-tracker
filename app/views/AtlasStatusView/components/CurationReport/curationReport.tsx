import { Global } from "@emotion/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type JSX } from "react";
import { FileReport } from "./components/FileReport/fileReport";
import { ReportOverview } from "./components/ReportOverview/reportOverview";
import { FILE_QUERY_PARAM } from "./constants";
import {
  HEADING_FONT_URL,
  HEADING_STYLES,
  StyledReport,
} from "./curationReport.styles";
import { useReportState } from "./hooks/UseReportState/hook";
import { type CurationReportProps } from "./types";

export const CurationReport = ({
  report,
  statusUrl,
}: CurationReportProps): JSX.Element => {
  const { query } = useRouter();
  const state = useReportState();
  const fileStem = query[FILE_QUERY_PARAM];
  const file = report.files.find((file) => file.fileStem === fileStem);
  return (
    <StyledReport>
      <Head>
        <link href={HEADING_FONT_URL} rel="stylesheet" />
      </Head>
      <Global styles={HEADING_STYLES} />
      {file ? (
        <FileReport file={file} statusUrl={statusUrl} />
      ) : (
        <ReportOverview report={report} state={state} statusUrl={statusUrl} />
      )}
    </StyledReport>
  );
};
