import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { JSX } from "react";

export const ValidIcon = ({
  fontSize = SVG_ICON_PROPS.FONT_SIZE.MEDIUM,
  viewBox = "0 0 24 24",
  ...props
}: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon fontSize={fontSize} viewBox={viewBox} {...props}>
      <rect
        fill={PALETTE.SUCCESS_MAIN}
        height="16"
        rx="8"
        width="16"
        x="4"
        y="4"
      />
      <path
        d="M10.4845 13.5298L15.2983 8.71613C15.4644 8.54991 15.6594 8.4668 15.8833 8.4668C16.1073 8.4668 16.3024 8.54991 16.4685 8.71613C16.6347 8.88224 16.7178 9.07569 16.7178 9.29646C16.7178 9.51724 16.6347 9.71074 16.4685 9.87696L11.078 15.2748C10.9118 15.441 10.7167 15.5241 10.4928 15.5241C10.2689 15.5241 10.0739 15.441 9.90765 15.2748L7.54315 12.9103C7.37693 12.7441 7.29226 12.5506 7.28915 12.3298C7.28604 12.109 7.36759 11.9156 7.53382 11.7495C7.69993 11.5832 7.89337 11.5001 8.11415 11.5001C8.33493 11.5001 8.52843 11.5832 8.69465 11.7495L10.4845 13.5298Z"
        fill={PALETTE.COMMON_WHITE}
      />
    </SvgIcon>
  );
};
