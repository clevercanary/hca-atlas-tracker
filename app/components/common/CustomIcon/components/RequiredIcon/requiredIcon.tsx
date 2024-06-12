import { smokeDark } from "@databiosphere/findable-ui/lib/theme/common/palette";
import { SvgIcon } from "@mui/material";

/**
 * Custom required icon.
 */

export const RequiredIcon = (): JSX.Element => {
  return (
    <SvgIcon viewBox="0 0 20 20" fontSize="small">
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="transparent"
        stroke={smokeDark}
        strokeWidth="2"
      />
    </SvgIcon>
  );
};
