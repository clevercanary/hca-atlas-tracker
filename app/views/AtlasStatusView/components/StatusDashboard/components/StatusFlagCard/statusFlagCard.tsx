import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { STACK_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/stack";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { ValidIcon } from "app/components/common/CustomIcon/components/ValidIcon/validIcon";
import { JSX } from "react";
import { FLAG_VALUE_LABEL } from "./constants";
import { StyledStack } from "./statusFlagCard.styles";
import { Props } from "./types";

export const StatusFlagCard = ({ flags }: Props): JSX.Element => {
  return (
    <FluidPaper elevation={0}>
      {flags.map((flag) => (
        <StyledStack key={flag.label}>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
          >
            {flag.label}
          </Typography>
          <Stack
            alignItems={STACK_PROPS.ALIGN_ITEMS.CENTER}
            direction={STACK_PROPS.DIRECTION.ROW}
            spacing={1}
            useFlexGap
          >
            <ValidIcon
              color={
                flag.value
                  ? SVG_ICON_PROPS.COLOR.SUCCESS
                  : SVG_ICON_PROPS.COLOR.SECONDARY
              }
            />
            <Typography
              color={
                flag.value
                  ? TYPOGRAPHY_PROPS.COLOR.SUCCESS
                  : TYPOGRAPHY_PROPS.COLOR.INK_LIGHT
              }
              variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL}
            >
              {flag.value ? FLAG_VALUE_LABEL.YES : FLAG_VALUE_LABEL.NO}
            </Typography>
          </Stack>
        </StyledStack>
      ))}
    </FluidPaper>
  );
};
