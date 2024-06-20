import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
} from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";

/**
 * Returns the breadcrumbs for the create atlas view.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [getAtlasesBreadcrumb(), getAtlasBreadcrumb()];
}
