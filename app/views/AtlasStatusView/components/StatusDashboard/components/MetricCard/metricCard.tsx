import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { JSX } from "react";
import { MetricRow } from "./components/MetricRow/metricRow";
import { BADGE_COLOR, BADGE_ICON } from "./constants";
import {
  StyledChip,
  StyledFluidPaper,
  StyledProgress,
  StyledStack,
} from "./metricCard.styles";
import { Props } from "./types";

export const MetricCard = ({ card }: Props): JSX.Element => {
  const BadgeIcon = card.badge ? BADGE_ICON[card.badge.variant] : null;
  return (
    <StyledFluidPaper elevation={0}>
      <StyledStack>
        <Stack>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XSMALL}
          >
            {card.title}
          </Typography>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_LARGE}
          >
            {card.total}
          </Typography>
        </Stack>
        <StyledProgress
          color="primary"
          value={card.progress}
          variant="determinate"
        />
        {card.badge && (
          <StyledChip
            color={BADGE_COLOR[card.badge.variant]}
            icon={
              BadgeIcon ? (
                <BadgeIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
              ) : undefined
            }
            label={card.badge.label}
          />
        )}
      </StyledStack>
      {card.sections.map((section) => (
        <StyledStack key={section.heading}>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
          >
            {section.heading}
          </Typography>
          {section.rows.map((row) => (
            <MetricRow key={row.label} row={row} />
          ))}
        </StyledStack>
      ))}
    </StyledFluidPaper>
  );
};
