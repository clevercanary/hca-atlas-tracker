import { PathParameter } from "../../../common/entities";
import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
} from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";

/**
 * Returns the breadcrumbs for the component atlases view.
 * @param pathParameter - Path parameter.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(pathParameter: PathParameter): Breadcrumb[] {
  return [getAtlasesBreadcrumb(), getAtlasBreadcrumb(pathParameter)];
}
