import {
  type InputBaseComponentProps,
  type ChipProps as MChipProps,
} from "@mui/material";

export type Props = InputBaseComponentProps & {
  viewProps?: Pick<MChipProps, "color" | "label" | "variant">;
};
