import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Tooltip, Typography } from "@mui/material";
import { CellContext } from "@tanstack/react-table";
import { HeatmapEntrySheet } from "../../../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { TOOLTIP_PROPS } from "./constants";
import { StyledBox } from "./graphValueCell.styles";
import {
  formatValue,
  getGraphColor,
  getGraphValues,
  renderTooltipTitle,
} from "./utils";

export const GraphValueCell = (
  cellContext: CellContext<HeatmapEntrySheet, number>
): JSX.Element | null => {
  const [value, numerator, denominator] = getGraphValues(cellContext);
  return (
    <StyledBox sx={{ backgroundColor: getGraphColor(value) }}>
      <Tooltip
        {...TOOLTIP_PROPS}
        title={renderTooltipTitle(value, numerator, denominator)}
      >
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INHERIT}
          variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}
        >
          {formatValue(value)}
        </Typography>
      </Tooltip>
    </StyledBox>
  );
};
