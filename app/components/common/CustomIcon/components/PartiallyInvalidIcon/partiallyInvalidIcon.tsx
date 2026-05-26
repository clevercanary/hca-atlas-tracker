import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { JSX } from "react";

export const PartiallyInvalidIcon = ({
  fontSize = SVG_ICON_PROPS.FONT_SIZE.MEDIUM,
  viewBox = "0 0 24 24",
  ...props
}: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon fontSize={fontSize} viewBox={viewBox} {...props}>
      <rect
        fill={PALETTE.ALERT_MAIN}
        height="16"
        rx="8"
        width="16"
        x="4"
        y="4"
      />
      <path
        d="M11.9987 13.1514L9.41604 15.7339C9.24993 15.9002 9.06082 15.9805 8.84871 15.9749C8.6366 15.9694 8.44748 15.8835 8.28137 15.7173C8.11515 15.5512 8.03204 15.3593 8.03204 15.1416C8.03204 14.9239 8.11515 14.732 8.28137 14.5659L10.8472 11.9999L8.26471 9.41727C8.09848 9.25116 8.01815 9.05927 8.02371 8.8416C8.02926 8.62393 8.11515 8.43205 8.28137 8.26594C8.44748 8.09971 8.63937 8.0166 8.85704 8.0166C9.07471 8.0166 9.2666 8.09971 9.43271 8.26594L11.9987 10.8484L14.5814 8.26594C14.7475 8.09971 14.9394 8.0166 15.157 8.0166C15.3747 8.0166 15.5666 8.09971 15.7327 8.26594C15.8989 8.43205 15.982 8.62393 15.982 8.8416C15.982 9.05927 15.8989 9.25116 15.7327 9.41727L13.1502 11.9999L15.7327 14.5826C15.8989 14.7487 15.982 14.9378 15.982 15.1499C15.982 15.362 15.8989 15.5512 15.7327 15.7173C15.5666 15.8835 15.3747 15.9666 15.157 15.9666C14.9394 15.9666 14.7475 15.8835 14.5814 15.7173L11.9987 13.1514Z"
        fill={PALETTE.COMMON_WHITE}
      />
      <circle
        cx="19"
        cy="19"
        fill="#F1A000"
        r="3.5"
        stroke={PALETTE.COMMON_WHITE}
      />
    </SvgIcon>
  );
};
