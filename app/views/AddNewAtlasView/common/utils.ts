import { Breadcrumb } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../constants/routes";

/**
 * Returns the breadcrumbs for the create form view.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: "",
      text: "Add New Atlas",
    },
  ];
}
