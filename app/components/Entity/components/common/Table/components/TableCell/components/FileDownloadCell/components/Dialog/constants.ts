import { DialogProps } from "@mui/material";

export const DIALOG_PROPS: Omit<DialogProps, "open"> = {
  fullWidth: true,
  maxWidth: false,
};
