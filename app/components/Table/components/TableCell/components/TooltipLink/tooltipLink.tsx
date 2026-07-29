import { TOOLTIP_PROPS } from "@/app/components/Entity/components/common/Table/components/TableCell/components/EllipsisCell/constants";
import {
  Link,
  LinkProps,
} from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Tooltip } from "@mui/material";
import { JSX } from "react";

export interface TooltipLinkProps extends LinkProps {
  tooltip?: string | null;
}

export const TooltipLink = ({
  tooltip,
  ...linkProps
}: TooltipLinkProps): JSX.Element => (
  <Tooltip {...TOOLTIP_PROPS} title={tooltip ?? null}>
    <span>
      <Link {...linkProps} />
    </span>
  </Tooltip>
);
