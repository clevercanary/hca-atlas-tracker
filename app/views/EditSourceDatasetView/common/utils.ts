import { Breadcrumb } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the edit atlas view.
 * @param atlasId - Atlas ID.
 * @param atlas - Atlas.
 * @param sourceDataset - Source dataset.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  atlasId: AtlasId,
  atlas?: HCAAtlasTrackerAtlas,
  sourceDataset?: HCAAtlasTrackerSourceDataset
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId),
      text: atlas ? getAtlasName(atlas) : "Source Datasets",
    },
    {
      path: "",
      text: sourceDataset?.title || "Edit Source Dataset",
    },
  ];
}
