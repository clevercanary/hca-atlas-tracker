import { CountCell } from "@/app/views/AtlasStatusView/components/CurationReport/components/CountCell/countCell";
import { IssueDialog } from "@/app/views/AtlasStatusView/components/CurationReport/components/IssueDialog/issueDialog";
import {
  StyledEmpty,
  StyledRowTitle,
} from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard.styles";
import { FILE_KINDS } from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { type AtlasIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  filterByKind,
  getFixedByLabel,
  getPriorityChip,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, Link, Typography } from "@mui/material";
import { type JSX, useState } from "react";
import {
  StyledDetail,
  StyledHeadRow,
  StyledIssue,
  StyledRow,
} from "./issueTable.styles";
import { type Props } from "./types";

export const IssueTable = ({
  issues,
  kindTotals,
  onCountClick,
  statusUrl,
}: Props): JSX.Element => {
  const [openIssue, setOpenIssue] = useState<AtlasIssue | null>(null);
  return (
    <>
      <StyledHeadRow>
        <span>#</span>
        <span>Issue</span>
        <span>Priority</span>
        <span>Objects</span>
        <span>Datasets</span>
        <span>Owner</span>
      </StyledHeadRow>
      {issues.map((issue, index) => (
        <StyledRow key={issue.key}>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
          >
            {index + 1}
          </Typography>
          <StyledIssue>
            <StyledRowTitle>
              <Link
                component="button"
                onClick={(): void => setOpenIssue(issue)}
                type="button"
                variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
              >
                {issue.title}
              </Link>
            </StyledRowTitle>
            {issue.detail && <StyledDetail>{issue.detail}</StyledDetail>}
          </StyledIssue>
          <span>
            <Chip
              {...getPriorityChip(issue)}
              variant={CHIP_PROPS.VARIANT.STATUS}
            />
          </span>
          {FILE_KINDS.map((kind) => {
            const count = filterByKind(issue.files, kind).length;
            return (
              <CountCell
                key={kind}
                count={count}
                onClick={(): void => onCountClick(issue, kind)}
              >
                {count}/{kindTotals[kind]}
              </CountCell>
            );
          })}
          {issue.who ? (
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
            >
              {getFixedByLabel(issue.who)}
            </Typography>
          ) : (
            <StyledEmpty>—</StyledEmpty>
          )}
        </StyledRow>
      ))}
      <IssueDialog
        issue={openIssue}
        onClose={(): void => setOpenIssue(null)}
        statusUrl={statusUrl}
      />
    </>
  );
};
