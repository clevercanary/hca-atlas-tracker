import { Breadcrumb } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the create source dataset view.
 * @param atlasId - Atlas ID.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  atlasId: AtlasId,
  atlas?: HCAAtlasTrackerAtlas
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId),
      text: atlas ? getAtlasName(atlas) : "Edit Atlas",
    },
    {
      path: "",
      text: "Add Source Dataset",
    },
  ];
}
