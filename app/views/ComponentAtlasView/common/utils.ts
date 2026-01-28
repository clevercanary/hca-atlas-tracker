import { Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getComponentAtlasBreadcrumb,
  getComponentAtlasesBreadcrumb,
} from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the component atlas view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  pathParameter: PathParameter,
  atlas?: HCAAtlasTrackerAtlas
): Breadcrumb[] {
  return [
    getAtlasesBreadcrumb(),
    getAtlasBreadcrumb(pathParameter, atlas),
    getComponentAtlasesBreadcrumb(pathParameter),
    getComponentAtlasBreadcrumb(),
  ];
}

/**
 * Returns the tabs for the integrated object view.
 * @param componentAtlas - Component atlas.
 * @returns tabs.
 */
export function getTabs(componentAtlas?: HCAAtlasTrackerComponentAtlas): Tab[] {
  const { sourceDatasetCount = 0 } = componentAtlas || {};
  return [
    { label: "Overview", value: ROUTE.COMPONENT_ATLAS },
    { label: "Validations", value: ROUTE.INTEGRATED_OBJECT_VALIDATIONS },
    {
      label: `Source Datasets ${
        sourceDatasetCount ? `(${sourceDatasetCount})` : null
      }`,
      value: ROUTE.INTEGRATED_OBJECT_SOURCE_DATASETS,
    },
  ];
}
