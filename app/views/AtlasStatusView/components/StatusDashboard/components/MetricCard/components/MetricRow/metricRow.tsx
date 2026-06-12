import { STACK_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/stack.js";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { JSX } from "react";
import { ROW_VARIANT_CONFIG } from "./constants";
import { StyledStack } from "./metricRow.styles";
import { Props } from "./types";

export const MetricRow = ({ row }: Props): JSX.Element => {
  const { color, Icon } = ROW_VARIANT_CONFIG[row.variant];
  return (
    <StyledStack>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
      >
        {row.label}
      </Typography>
      <Stack
        alignItems={STACK_PROPS.ALIGN_ITEMS.CENTER}
        direction={STACK_PROPS.DIRECTION.ROW}
        spacing={1}
        useFlexGap
      >
        {Icon && <Icon sx={{ color }} />}
        <Typography
          sx={{ color }}
          variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL}
        >
          {row.value}
        </Typography>
      </Stack>
    </StyledStack>
  );
};
