import { JSX } from "react";
import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { RoundedPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/RoundedPaper/roundedPaper";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { SVG_ICON_PROPS } from "./constants";
import { SummaryProps } from "./entities";
import { StyledGrid, StyledTypography } from "./summary.styles";

export const Summary = ({
  summary,
  summaryKeyValues,
}: SummaryProps): JSX.Element => {
  return (
    <StyledGrid>
      {summaryKeyValues.map(([key, value]) => {
        const count = summary[key];
        return (
          <RoundedPaper elevation={0} key={key}>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
            >
              {value}
            </Typography>
            <StyledTypography
              summaryCount={count}
              summaryKey={key}
              variant={TYPOGRAPHY_PROPS.VARIANT.HEADING}
            >
              {count}
              {count > 0 ? (
                <ErrorIcon {...SVG_ICON_PROPS} />
              ) : (
                <SuccessIcon {...SVG_ICON_PROPS} />
              )}
            </StyledTypography>
          </RoundedPaper>
        );
      })}
    </StyledGrid>
  );
};
