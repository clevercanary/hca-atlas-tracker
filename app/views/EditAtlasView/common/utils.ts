import { Breadcrumb } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the create form view.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(atlas?: HCAAtlasTrackerAtlas): Breadcrumb[] {
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
