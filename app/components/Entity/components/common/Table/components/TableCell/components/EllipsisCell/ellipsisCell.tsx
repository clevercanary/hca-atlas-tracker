import { JSX } from "react";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Tooltip, Typography } from "@mui/material";
import { CellContext, RowData } from "@tanstack/react-table";
import { TOOLTIP_PROPS } from "./constants";

export const EllipsisCell = ({
  getValue,
}: CellContext<RowData, string>): JSX.Element | null => {
  const value = getValue();
  return (
    <Tooltip {...TOOLTIP_PROPS} title={value}>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INHERIT}
        component="span"
        noWrap
        variant={TYPOGRAPHY_PROPS.VARIANT.INHERIT}
      >
        {value}
      </Typography>
    </Tooltip>
  );
};
