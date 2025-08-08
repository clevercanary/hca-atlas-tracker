import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { CellContext, RowData } from "@tanstack/react-table";
import { StyledBox } from "./graphValueCell.styles";
import { getGraphColor } from "./utils";

export const GraphValueCell = ({
  getValue,
}: CellContext<RowData, number>): JSX.Element | null => {
  const value = getValue();
  const graphValue = value.value;
  return (
    <StyledBox sx={{ backgroundColor: getGraphColor(graphValue) }}>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INHERIT}
        variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}
      >
        {graphValue}
      </Typography>
    </StyledBox>
  );
};
