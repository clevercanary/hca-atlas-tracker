import { ChipProps } from "@mui/material";

type ChipPropsOptions = {
  COLOR: typeof COLOR;
};

const COLOR: Record<string, ChipProps["color"]> = {
  CAUTION: "caution",
  SUCCESS_DARK: "successDark",
};

export const CHIP_PROPS: ChipPropsOptions = {
  COLOR,
};
