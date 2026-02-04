import { Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getAtlasSourceDatasetBreadcrumb,
  getAtlasSourceDatasetsBreadcrumb,
  getAtlasSourceDatasetValidationsBreadcrumb,
} from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the source dataset validations view.
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
    getAtlasSourceDatasetsBreadcrumb(pathParameter),
    getAtlasSourceDatasetBreadcrumb(pathParameter),
    getAtlasSourceDatasetValidationsBreadcrumb(),
  ];
}

/**
 * Returns the tabs for the source dataset validations view.
 * @returns tabs.
 */
export function getTabs(): Tab[] {
  return [
    { label: "Overview", value: ROUTE.ATLAS_SOURCE_DATASET },
    { label: "Validations", value: ROUTE.ATLAS_SOURCE_DATASET_VALIDATION },
  ];
}
