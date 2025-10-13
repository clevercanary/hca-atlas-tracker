import { ICON_BUTTON_PROPS as MUI_ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS as MUI_SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { IconButtonProps, SvgIconProps } from "@mui/material";

export const ICON_BUTTON_PROPS: IconButtonProps = {
  color: MUI_ICON_BUTTON_PROPS.COLOR.SECONDARY,
  size: MUI_ICON_BUTTON_PROPS.SIZE.MEDIUM,
};

export const SVG_ICON_PROPS: SvgIconProps = {
  color: MUI_SVG_ICON_PROPS.COLOR.INK_LIGHT,
  fontSize: MUI_SVG_ICON_PROPS.FONT_SIZE.SMALL,
};
