import { DialogProps } from "@mui/material";

export const DIALOG_PROPS: Omit<DialogProps, "open"> = {
  closeAfterTransition: false, // See https://github.com/mui/material-ui/issues/43106#issuecomment-2314809028.
  fullWidth: true,
  maxWidth: false,
};
