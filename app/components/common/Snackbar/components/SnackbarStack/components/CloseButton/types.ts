import { type SnackbarEntry } from "@/app/components/common/Snackbar/provider/types";

export interface CloseButtonProps {
  entryId: SnackbarEntry["id"];
  label: string;
}
