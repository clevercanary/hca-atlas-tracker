import { OpenInNewIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/OpenInNewIcon/openInNewIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { ElementType } from "react";
import { Label, Text } from "./labelIconMenuItem.styles";

export interface LabelIconMenuItemProps {
  Icon?: ElementType;
  iconFontSize?: string;
  label: string;
}

export const LabelIconMenuItem = ({
  Icon = OpenInNewIcon,
  iconFontSize = "xsmall",
  label,
}: LabelIconMenuItemProps): JSX.Element => {
  return (
    <Label>
      <Text>{label}</Text>
      <Icon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} fontSize={iconFontSize} />
    </Label>
  );
};
