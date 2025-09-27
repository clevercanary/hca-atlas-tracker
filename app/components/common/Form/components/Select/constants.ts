import { SelectProps } from "@mui/material";

export const SELECT_PROPS: SelectProps = {
  MenuProps: {
    slotProps: { paper: { sx: { my: 1 }, variant: "menu" } },
  },
  fullWidth: true,
  size: "small",
};
