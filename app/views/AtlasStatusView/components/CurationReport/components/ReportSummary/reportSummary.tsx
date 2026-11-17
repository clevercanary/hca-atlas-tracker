import { SummaryLine } from "@/app/views/AtlasStatusView/components/CurationReport/components/SummaryLine/summaryLine";
import { getFileSegments } from "@/app/views/AtlasStatusView/components/CurationReport/components/SummaryLine/utils";
import {
  FILE_KIND_PLURAL_LABEL,
  FILE_KINDS,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  ISSUE_PRIORITY,
  VERDICT,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  countPriority,
  filterByKind,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type CSSProperties, type JSX } from "react";
import {
  StyledKind,
  StyledKindCount,
  StyledKinds,
  StyledLegend,
  StyledLegendItem,
  StyledNote,
} from "./reportSummary.styles";
import { type Props } from "./types";
import { getIssueBreakdown } from "./utils";

// Prototype: files by state, per kind, above the tables.
export const ReportSummary = ({
  issues,
  publishingStepCount,
  report,
}: Props): JSX.Element => {
  const blockedFileCount = report.files.filter(
    (file) => countPriority(file, ISSUE_PRIORITY.BLOCKS) > 0,
  ).length;
  const issueBreakdown = getIssueBreakdown(issues);
  return (
    <StyledKinds>
      {FILE_KINDS.map((kind) => {
        const files = filterByKind(report.files, kind);
        // Publish ready always shows, so a zero reads as progress still to make.
        const segments = getFileSegments(files).filter(
          ({ count, label }) => count || label === VERDICT_LABEL[VERDICT.READY],
        );
        return (
          <StyledKind key={kind} elevation={0}>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
            >
              {FILE_KIND_PLURAL_LABEL[kind]}
            </Typography>
            <StyledKindCount>{files.length}</StyledKindCount>
            <SummaryLine segments={segments} />
            <StyledLegend>
              {segments.map(({ color, count, label }) => (
                <StyledLegendItem
                  key={label}
                  style={{ "--tone": color } as CSSProperties}
                >
                  {count} {label.toLowerCase()}
                </StyledLegendItem>
              ))}
            </StyledLegend>
          </StyledKind>
        );
      })}
      <StyledKind elevation={0}>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
        >
          Files with a blocking issue
        </Typography>
        <StyledKindCount>{blockedFileCount}</StyledKindCount>
        <StyledNote>of {report.files.length} files</StyledNote>
      </StyledKind>
      <StyledKind elevation={0}>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
        >
          Issue types
        </Typography>
        <StyledKindCount>{issues.length}</StyledKindCount>
        <StyledNote>
          {issueBreakdown}
          {publishingStepCount > 0 &&
            `, plus ${publishingStepCount} publishing ${publishingStepCount === 1 ? "step" : "steps"}`}
        </StyledNote>
      </StyledKind>
    </StyledKinds>
  );
};
