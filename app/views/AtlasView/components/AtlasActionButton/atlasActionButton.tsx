import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { type ButtonProps } from "@mui/material";
import { type JSX } from "react";
import { AlignedButton } from "./atlasActionButton.styles";

export const AtlasActionButton = (props: ButtonProps): JSX.Element => {
  return <AlignedButton {...BUTTON_PRESETS.SECONDARY_OUTLINED} {...props} />;
};
