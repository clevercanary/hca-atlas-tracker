import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Breadcrumbs as MBreadcrumbs,
  Link as MLink,
  Typography as MTypography,
} from "@mui/material";
import { ReactNode } from "react";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";

export interface Breadcrumb {
  path: string;
  text: ReactNode;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onNavigate?: FormManager["onNavigate"];
}

export const Breadcrumbs = ({
  breadcrumbs,
  onNavigate = navigateToRoute,
}: BreadcrumbsProps): JSX.Element => {
  return (
    <MBreadcrumbs separator={<ChevronRightRoundedIcon fontSize="xxsmall" />}>
      {breadcrumbs.map(({ path, text }, b) =>
        path ? (
          <MLink
            key={b}
            onClick={(): void => onNavigate(path)}
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
