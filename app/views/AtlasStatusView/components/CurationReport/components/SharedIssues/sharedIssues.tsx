import {
  OWNER_LABEL,
  PRIORITY_BORDER,
  PRIORITY_CHIP,
  SHARED_ISSUE_LIMIT,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  StyledAffectedFiles,
  StyledIssue,
  StyledIssueToggle,
  StyledIssueTop,
  StyledSection,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import { type SharedIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Chip, Collapse, Typography } from "@mui/material";
import Link from "next/link";
import { type JSX, useId, useState } from "react";

interface Props {
  getFileHref: (fileStem?: string) => string;
  sharedIssues: SharedIssue[];
}

interface IssueProps {
  getFileHref: (fileStem?: string) => string;
  issue: SharedIssue;
}

const SharedIssueCard = ({ getFileHref, issue }: IssueProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const filesId = useId();
  const fileCount = issue.files.length;
  return (
    <StyledIssue borderColor={PRIORITY_BORDER[issue.priority]} elevation={0}>
      <StyledIssueToggle
        aria-controls={filesId}
        aria-expanded={open}
        component="div"
        onClick={(): void => setOpen((isOpen) => !isOpen)}
      >
        <StyledIssueTop>
          <Chip
            color={PRIORITY_CHIP[issue.priority]}
            label={`P${issue.priority}`}
          />
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
          >
            {issue.title}
          </Typography>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
          >
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </Typography>
          <ChevronRightRoundedIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
        </StyledIssueTop>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
        >
          {issue.note}
        </Typography>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
        >
          Fix: {OWNER_LABEL[issue.owner]}
          {issue.tool && <code> {issue.tool}</code>}
        </Typography>
      </StyledIssueToggle>
      <Collapse id={filesId} in={open} unmountOnExit>
        <StyledAffectedFiles>
          {issue.files.map((file) => (
            <li key={file.fileStem}>
              <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}>
                <Link href={getFileHref(file.fileStem)}>
                  {file.displayName}
                </Link>
              </Typography>
            </li>
          ))}
        </StyledAffectedFiles>
      </Collapse>
    </StyledIssue>
  );
};

export const SharedIssues = ({
  getFileHref,
  sharedIssues,
}: Props): JSX.Element => {
  const shown = sharedIssues.slice(0, SHARED_ISSUE_LIMIT);
  return (
    <StyledSection>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
        component="h3"
        variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XSMALL}
      >
        Issues shared across files
      </Typography>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
      >
        The {shown.length} most urgent of {sharedIssues.length}, ordered by
        priority and then by how many files they affect. Select an issue to see
        its files.
      </Typography>
      {shown.map((issue) => (
        <SharedIssueCard
          getFileHref={getFileHref}
          issue={issue}
          key={issue.id}
        />
      ))}
    </StyledSection>
  );
};
