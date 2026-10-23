import { type SnackbarEntry } from "@/app/components/common/Snackbar/provider/types";

export interface SnackbarContentProps {
  entry: SnackbarEntry;
}

export interface StyledSnackbarContentProps {
  severity: SnackbarEntry["severity"];
}
