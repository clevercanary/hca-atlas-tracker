import { SVG_ICON_PROPS as MUI_SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { StackProps, SvgIconProps } from "@mui/material";

export const INNER_STACK_PROPS: StackProps = {
  alignItems: "center",
  direction: "row",
  spacing: 1,
  useFlexGap: true,
};

export const STACK_PROPS: StackProps = {
  spacing: 1,
  useFlexGap: true,
};

export const SVG_ICON_PROPS: SvgIconProps = {
  fontSize: MUI_SVG_ICON_PROPS.FONT_SIZE.SMALL,
};
