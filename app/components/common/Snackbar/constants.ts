import { type SnackbarOrigin } from "@mui/material";

type SnackbarPropsOptions = {
  ORIGIN: typeof ORIGIN;
};

const ORIGIN = {
  BOTTOM_LEFT: { horizontal: "left", vertical: "bottom" },
  BOTTOM_RIGHT: { horizontal: "right", vertical: "bottom" },
  TOP_LEFT: { horizontal: "left", vertical: "top" },
  TOP_RIGHT: { horizontal: "right", vertical: "top" },
} as const satisfies Record<string, SnackbarOrigin>;

export const SNACKBAR_PROPS: SnackbarPropsOptions = {
  ORIGIN,
};
