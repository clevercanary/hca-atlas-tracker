import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getSourceStudiesBreadcrumb,
  getSourceStudyBreadcrumb,
} from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";

/**
 * Returns the breadcrumbs for the source study view.
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
    getSourceStudiesBreadcrumb(pathParameter),
    getSourceStudyBreadcrumb(),
  ];
}
