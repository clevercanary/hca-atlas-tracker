import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX } from "react";
import { StyledHeading, StyledSection } from "./reportSection.styles";
import { type Props } from "./types";

export const ReportSection = ({
  children,
  description,
  subtitle,
  title,
}: Props): JSX.Element => {
  return (
    <StyledSection>
      <StyledHeading>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          component="h2"
          variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
          >
            {subtitle}
          </Typography>
        )}
      </StyledHeading>
      {description && (
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400_2_LINES}
        >
          {description}
        </Typography>
      )}
      {children}
    </StyledSection>
  );
};
