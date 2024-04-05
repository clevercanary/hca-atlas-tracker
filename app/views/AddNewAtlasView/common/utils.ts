import { Breadcrumb } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ROUTE_ATLASES } from "../../../constants/routes";

/**
 * Returns the breadcrumbs for the create form view.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [
    {
      path: ROUTE_ATLASES,
      text: "Atlases",
    },
    {
      path: "",
      text: "Add New Atlas",
    },
  ];
}
