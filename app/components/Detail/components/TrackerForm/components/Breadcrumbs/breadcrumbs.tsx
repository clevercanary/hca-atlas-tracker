import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Breadcrumbs as MBreadcrumbs,
  Link as MLink,
  Typography as MTypography,
} from "@mui/material";
import { ReactNode } from "react";
import { FormAction } from "../../../../../../hooks/useFormManager/common/entities";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";
import { RouteValue } from "../../../../../../routes/entities";

export interface Breadcrumb {
  path: string;
  route?: RouteValue;
  text: ReactNode;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onNavigate?: FormAction["onNavigate"];
}

export const Breadcrumbs = ({
  breadcrumbs,
  onNavigate = navigateToRoute,
}: BreadcrumbsProps): JSX.Element => {
  return (
    <MBreadcrumbs
      separator={
        <ChevronRightRoundedIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
      }
    >
      {breadcrumbs.map(({ path, route, text }, b) =>
        path ? (
          <MLink
            key={b}
            onClick={(): void => onNavigate(path, route)}
            sx={{ cursor: "pointer" }}
          >
            {text}
          </MLink>
        ) : (
          <MTypography key={b} maxWidth={180} noWrap>
            {text}
          </MTypography>
        )
      )}
    </MBreadcrumbs>
  );
};
