import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Custom required icon.
 */

export const RequiredIcon = ({
  fontSize = "small",
  viewBox = "0 0 20 20",
  ...props /* Spread props to allow for Mui SvgIconProps specific prop overrides e.g. "htmlColor". */
}: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon viewBox={viewBox} fontSize={fontSize} {...props}>
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
};
