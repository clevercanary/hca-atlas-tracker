import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../common/utils";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the create source study view.
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
      route: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.SOURCE_STUDIES, atlasId),
      route: ROUTE.SOURCE_STUDIES,
      text: atlas ? getAtlasName(atlas) : "Atlas",
    },
    {
      path: "",
      text: "Add Source Study",
    },
  ];
}
