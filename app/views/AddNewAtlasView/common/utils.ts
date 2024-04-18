import { Breadcrumb } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the create atlas view.
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
