import { Breadcrumb } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the edit atlas view.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(atlas?: HCAAtlasTrackerAtlas): Breadcrumb[] {
  const atlasName = atlas && getAtlasName(atlas);
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
