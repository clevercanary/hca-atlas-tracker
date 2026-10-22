import { type SnackbarEntry } from "@/app/components/common/Snackbar/provider/types";
import { type GrowProps } from "@mui/material";

export interface EntryGrowProps {
  children: GrowProps["children"];
  entry: SnackbarEntry;
}
