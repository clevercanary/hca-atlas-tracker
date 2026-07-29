import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumb } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getComponentAtlasBreadcrumb,
  getComponentAtlasesBreadcrumb,
  getIntegratedObjectValidationsBreadcrumb,
} from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { ROUTE } from "@/app/routes/constants";
import { Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";

/**
 * Returns the breadcrumbs for the integrated object validations view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  pathParameter: PathParameter,
  atlas?: HCAAtlasTrackerAtlas,
): Breadcrumb[] {
  return [
    getAtlasesBreadcrumb(),
    getAtlasBreadcrumb(pathParameter, atlas),
    getComponentAtlasesBreadcrumb(pathParameter),
    getComponentAtlasBreadcrumb(pathParameter),
    getIntegratedObjectValidationsBreadcrumb(),
  ];
}

/**
 * Returns the tabs for the integrated object validations view.
 * @param componentAtlas - Component atlas.
 * @returns tabs.
 */
export function getTabs(componentAtlas?: HCAAtlasTrackerComponentAtlas): Tab[] {
  const { sourceDatasetCount = 0 } = componentAtlas || {};
  return [
    { label: "Overview", value: ROUTE.COMPONENT_ATLAS },
    { label: "Validations", value: ROUTE.INTEGRATED_OBJECT_VALIDATION },
    {
      label: `Source Datasets ${
        sourceDatasetCount ? `(${sourceDatasetCount})` : ""
      }`,
      value: ROUTE.INTEGRATED_OBJECT_SOURCE_DATASETS,
    },
  ];
}
