import { SelectProps } from "@mui/material";

export const SELECT_PROPS: SelectProps = {
  MenuProps: {
    slotProps: {
      paper: {
        elevation: 1,
        sx: { maxHeight: "356px", maxWidth: "min-content", my: 1 },
        variant: "menu",
      },
    },
  },
  fullWidth: true,
  size: "small",
};
