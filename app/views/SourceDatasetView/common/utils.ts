import {
  AtlasId,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceStudy,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../common/utils";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the atlas view.
 * @param atlasId - Atlas ID.
 * @param atlas - Atlas.
 * @param sourceDataset - Source dataset.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  atlasId: AtlasId,
  atlas?: HCAAtlasTrackerAtlas,
  sourceDataset?: HCAAtlasTrackerSourceStudy
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      route: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.SOURCE_DATASETS, atlasId),
      route: ROUTE.SOURCE_DATASETS,
      text: atlas ? getAtlasName(atlas) : "Source Datasets",
    },
    {
      path: "",
      text: sourceDataset?.title || "Source Dataset",
    },
  ];
}
