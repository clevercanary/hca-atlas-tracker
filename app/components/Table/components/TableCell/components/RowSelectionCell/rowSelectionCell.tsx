import { CheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/CheckedIcon/checkedIcon";
import { UncheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UncheckedIcon/uncheckedIcon";
import {
  Checkbox as MCheckbox,
  FormControlLabel as DXFormControlLabel,
} from "@mui/material";
import { Row, RowData } from "@tanstack/react-table";
import { ReactNode } from "react";

export interface RowSelectionCellProps<T extends RowData> {
  label?: ReactNode;
  row: Row<T>;
}

export const RowSelectionCell = <T extends RowData>({
  label,
  row,
}: RowSelectionCellProps<T>): JSX.Element => {
  const { getCanSelect, getIsSelected, getToggleSelectedHandler } = row;
  return (
    <DXFormControlLabel
      control={
        <MCheckbox
          checked={getIsSelected()}
          checkedIcon={<CheckedIcon />}
          disabled={!getCanSelect()}
          icon={<UncheckedIcon />}
          onChange={getToggleSelectedHandler()}
        />
      }
      label={label}
    />
  );
};
