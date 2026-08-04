import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type Breadcrumb } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getAtlasSourceDatasetBreadcrumb,
  getAtlasSourceDatasetsBreadcrumb,
  getAtlasSourceDatasetValidationsBreadcrumb,
} from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { ROUTE } from "@/app/routes/constants";
import { type Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";

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
