import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { JSX } from "react";

export const ValidIcon = ({
  viewBox = "0 0 24 24",
  ...props
}: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      <circle
        cx="12"
        cy="12"
        fill="none"
        r="10.5"
        stroke={PALETTE.SUCCESS_MAIN}
        strokeWidth="3"
      />
      <path
        d="M10.4836 13.2831L15.1669 8.5998C15.3669 8.3998 15.603 8.2998 15.8752 8.2998C16.1474 8.2998 16.3836 8.3998 16.5836 8.5998C16.7836 8.7998 16.8836 9.03314 16.8836 9.2998C16.8836 9.56647 16.7836 9.7998 16.5836 9.9998L11.2002 15.3831C11.0002 15.5831 10.7641 15.6831 10.4919 15.6831C10.2197 15.6831 9.98356 15.5831 9.78356 15.3831L7.43356 13.0331C7.23356 12.8331 7.13078 12.5998 7.12523 12.3331C7.11967 12.0665 7.21689 11.8331 7.41689 11.6331C7.61689 11.4331 7.85023 11.3331 8.11689 11.3331C8.38356 11.3331 8.61689 11.4331 8.81689 11.6331L10.4836 13.2831Z"
        fill={PALETTE.SUCCESS_MAIN}
      />
    </SvgIcon>
  );
};
