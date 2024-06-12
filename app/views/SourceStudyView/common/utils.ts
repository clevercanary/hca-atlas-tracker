import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceStudy,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../common/entities";
import { getRouteURL } from "../../../common/utils";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the atlas view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @param sourceStudy - Source study.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  pathParameter: PathParameter,
  atlas?: HCAAtlasTrackerAtlas,
  sourceStudy?: HCAAtlasTrackerSourceStudy
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      route: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.SOURCE_STUDIES, pathParameter),
      route: ROUTE.SOURCE_STUDIES,
      text: atlas ? getAtlasName(atlas) : "Source Studies",
    },
    {
      path: "",
      text: sourceStudy?.title || "Source Study",
    },
  ];
}
