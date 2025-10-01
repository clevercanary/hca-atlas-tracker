import { BUTTON_PROPS as MUI_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { ICON_BUTTON_PROPS as MUI_ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS as MUI_SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { ButtonProps, IconButtonProps, SvgIconProps } from "@mui/material";

export const BUTTON_PROPS: Partial<ButtonProps> = {
  color: MUI_BUTTON_PROPS.COLOR.SECONDARY,
  variant: MUI_BUTTON_PROPS.VARIANT.CONTAINED,
};

export const ICON_BUTTON_PROPS: Partial<IconButtonProps> = {
  color: MUI_ICON_BUTTON_PROPS.COLOR.SECONDARY,
  size: MUI_ICON_BUTTON_PROPS.SIZE.LARGE,
};

export const SVG_ICON_PROPS: Partial<SvgIconProps> = {
  color: MUI_SVG_ICON_PROPS.COLOR.INK_LIGHT,
  fontSize: MUI_SVG_ICON_PROPS.FONT_SIZE.SMALL,
};
