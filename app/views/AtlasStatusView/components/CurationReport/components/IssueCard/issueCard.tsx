import { getOwnerLabel } from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, Typography } from "@mui/material";
import { type JSX } from "react";
import {
  StyledCard,
  StyledContent,
  StyledEvidence,
  StyledHeader,
  StyledTags,
} from "./issueCard.styles";
import { type Props } from "./types";

export const IssueCard = ({
  issue,
  label,
  labelColor,
  showEvidence = false,
}: Props): JSX.Element => {
  return (
    <StyledCard elevation={0}>
      <StyledContent>
        <StyledHeader>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            component="h3"
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_LARGE_500}
          >
            {issue.title}
          </Typography>
          <StyledTags>
            {label && (
              <Chip
                color={labelColor}
                label={label}
                variant={CHIP_PROPS.VARIANT.STATUS}
              />
            )}
            {issue.who && <Chip label={getOwnerLabel(issue.who)} />}
          </StyledTags>
        </StyledHeader>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400_2_LINES}
        >
          {issue.detail}
        </Typography>
        {showEvidence && issue.evidence && (
          <StyledEvidence>{issue.evidence}</StyledEvidence>
        )}
      </StyledContent>
    </StyledCard>
  );
};
