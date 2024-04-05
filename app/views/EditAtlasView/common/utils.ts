import { Breadcrumb } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../constants/routes";
import { Atlas } from "../../../hooks/useFetchAtlas";

/**
 * Returns the breadcrumbs for the create form view.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(atlas: Atlas): Breadcrumb[] {
  const { atlasName } = atlas || {};
  return [
    {
      path: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: "",
      text: atlasName || "Edit Atlas",
    },
  ];
}
