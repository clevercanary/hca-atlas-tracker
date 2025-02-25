import { CustomSVGIconProps } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/common/entities";
import { SvgIcon } from "@mui/material";

/**
 * Custom partially complete icon.
 */

export const PartiallyCompleteIcon = ({
  fontSize = "small",
  viewBox = "0 0 18 18",
  ...props /* Spread props to allow for Mui SvgIconProps specific prop overrides e.g. "htmlColor". */
}: CustomSVGIconProps): JSX.Element => {
  return (
    <SvgIcon viewBox={viewBox} fontSize={fontSize} {...props}>
      <path
        d="m9 16.5c-1.0375 0-2.0125-0.1969-2.925-0.5906-0.9125-0.3938-1.7062-0.9282-2.3812-1.6032s-1.2094-1.4687-1.6031-2.3812-0.59062-1.8875-0.59062-2.925 0.19687-2.0125 0.59062-2.925 0.92813-1.7062 1.6031-2.3812 1.4688-1.2094 2.3812-1.6031 1.8875-0.59062 2.925-0.59062 2.0125 0.19687 2.925 0.59062 1.7062 0.92813 2.3812 1.6031 1.2094 1.4688 1.6032 2.3812c0.3937 0.9125 0.5906 1.8875 0.5906 2.925s-0.1969 2.0125-0.5906 2.925c-0.3938 0.9125-0.9282 1.7062-1.6032 2.3812s-1.4687 1.2094-2.3812 1.6032c-0.9125 0.3937-1.8875 0.5906-2.925 0.5906zm0-1.5v-12c-1.675 0-3.0938 0.58125-4.2562 1.7438s-1.7438 2.5812-1.7438 4.2562 0.58125 3.0937 1.7438 4.2562 2.5812 1.7438 4.2562 1.7438z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
