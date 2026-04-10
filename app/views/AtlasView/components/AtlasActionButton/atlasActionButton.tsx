import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { ButtonProps } from "@mui/material";
import { JSX } from "react";
import { AlignedButton } from "./atlasActionButton.styles";

export const AtlasActionButton = (props: ButtonProps): JSX.Element => {
  return <AlignedButton {...BUTTON_PROPS.SECONDARY_CONTAINED} {...props} />;
};
