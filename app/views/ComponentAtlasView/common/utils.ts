import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../common/entities";
import { getRouteURL } from "../../../common/utils";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the component atlas view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @param componentAtlas - Component atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  pathParameter: PathParameter,
  atlas?: HCAAtlasTrackerAtlas,
  componentAtlas?: HCAAtlasTrackerComponentAtlas
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      route: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.COMPONENT_ATLASES, pathParameter),
      route: ROUTE.COMPONENT_ATLASES,
      text: atlas ? getAtlasName(atlas) : "Component Atlases",
    },
    {
      path: "",
      text: componentAtlas?.title || "Component Atlas",
    },
  ];
}
