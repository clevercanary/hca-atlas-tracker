import {
  StyledCheck,
  StyledChecks,
  StyledSection,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import { type ClearedCheck } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX } from "react";

interface Props {
  clearedChecks: ClearedCheck[];
  fileCount: number;
}

export const ClearedChecks = ({
  clearedChecks,
  fileCount,
}: Props): JSX.Element => (
  <StyledSection>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      component="h3"
      variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XSMALL}
    >
      Cleared checks
    </Typography>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
      variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
    >
      How many files passed each check.
    </Typography>
    <StyledChecks>
      {clearedChecks.map((check) => (
        <StyledCheck elevation={0} key={check.id}>
          <SuccessIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
          >
            {check.title}
          </Typography>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.SUCCESS}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
          >
            {check.passed} / {fileCount}
          </Typography>
        </StyledCheck>
      ))}
    </StyledChecks>
  </StyledSection>
);
