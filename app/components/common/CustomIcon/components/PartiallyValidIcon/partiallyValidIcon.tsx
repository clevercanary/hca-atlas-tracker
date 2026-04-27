import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { JSX } from "react";

export const PartiallyValidIcon = ({
  fontSize = SVG_ICON_PROPS.FONT_SIZE.MEDIUM,
  viewBox = "0 0 24 24",
  ...props
}: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon fontSize={fontSize} viewBox={viewBox} {...props}>
      <path
        d="M13.6426 22.3707C16.1119 21.9796 18.3606 20.7203 19.9843 18.8192C21.6079 16.9181 22.5 14.5001 22.5 12C22.5 9.49992 21.6079 7.08187 19.9843 5.1808C18.3606 3.27972 16.1119 2.02037 13.6426 1.62927"
        fill="none"
        stroke="#DD9700"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M10.3574 22.3707C7.88814 21.9796 5.63941 20.7203 4.01574 18.8192C2.39206 16.9181 1.5 14.5001 1.5 12C1.5 9.49992 2.39206 7.08187 4.01574 5.1808C5.63941 3.27972 7.88814 2.02037 10.3574 1.62927"
        fill="none"
        stroke={PALETTE.SUCCESS_MAIN}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M10.4836 13.2831L15.1669 8.5998C15.3669 8.3998 15.603 8.2998 15.8752 8.2998C16.1474 8.2998 16.3836 8.3998 16.5836 8.5998C16.7836 8.7998 16.8836 9.03314 16.8836 9.2998C16.8836 9.56647 16.7836 9.7998 16.5836 9.9998L11.2002 15.3831C11.0002 15.5831 10.7641 15.6831 10.4919 15.6831C10.2197 15.6831 9.98356 15.5831 9.78356 15.3831L7.43356 13.0331C7.23356 12.8331 7.13078 12.5998 7.12523 12.3331C7.11967 12.0665 7.21689 11.8331 7.41689 11.6331C7.61689 11.4331 7.85023 11.3331 8.11689 11.3331C8.38356 11.3331 8.61689 11.4331 8.81689 11.6331L10.4836 13.2831Z"
        fill={PALETTE.SUCCESS_MAIN}
      />
    </SvgIcon>
  );
};
