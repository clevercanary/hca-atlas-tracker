import { ChecksGrid } from "@/app/views/AtlasStatusView/components/CurationReport/components/ChecksGrid/checksGrid";
import { IssueList } from "@/app/views/AtlasStatusView/components/CurationReport/components/IssueList/issueList";
import { PublishingSteps } from "@/app/views/AtlasStatusView/components/CurationReport/components/PublishingSteps/publishingSteps";
import { ReportSection } from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportSection/reportSection";
import {
  FILE_KIND_LABEL,
  PRIORITIES,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  VERDICT_COLOR,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { countPriority } from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { Chip, Typography } from "@mui/material";
import { type JSX } from "react";
import {
  StyledBackLink,
  StyledChips,
  StyledHeader,
  StyledStem,
} from "./fileReport.styles";
import { type Props } from "./types";

export const FileReport = ({ file, statusUrl }: Props): JSX.Element => {
  return (
    <>
      <StyledHeader elevation={0}>
        <StyledBackLink href={statusUrl}>
          <ChevronLeftRoundedIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
          Back to report
        </StyledBackLink>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
        >
          {FILE_KIND_LABEL[file.kind]}
        </Typography>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          component="h2"
          variant={TYPOGRAPHY_PROPS.VARIANT.HEADING}
        >
          {file.displayName}
        </Typography>
        <StyledStem>{file.fileStem}.h5ad</StyledStem>
        <StyledChips>
          <Chip
            color={VERDICT_COLOR[file.verdict]}
            label={VERDICT_LABEL[file.verdict]}
            variant={CHIP_PROPS.VARIANT.STATUS}
          />
          {PRIORITIES.map((priority) => {
            const count = countPriority(file, priority);
            return count ? (
              <Chip
                key={priority}
                color={PRIORITY_COLOR[priority]}
                label={`${count} ${PRIORITY_LABEL[priority].toLowerCase()}`}
              />
            ) : null;
          })}
        </StyledChips>
        {file.verdictReason && (
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400_2_LINES}
          >
            {file.verdictReason}
          </Typography>
        )}
      </StyledHeader>
      <ReportSection
        subtitle={`${file.needsWork.length} issues`}
        title="Needs work"
      >
        <IssueList issues={file.needsWork} showEvidence />
      </ReportSection>
      <PublishingSteps steps={file.publishingSteps} />
      <ReportSection
        subtitle={`${file.looksGood.length} checks passed`}
        title="Looks good"
      >
        <ChecksGrid checks={file.looksGood} />
      </ReportSection>
    </>
  );
};
