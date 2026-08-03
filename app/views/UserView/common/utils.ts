import { type HCAAtlasTrackerUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type Breadcrumb } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getUserBreadcrumb,
  getUsersBreadcrumb,
} from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";

/**
 * Returns the breadcrumbs for the edit user view.
 * @param user - User.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(user?: HCAAtlasTrackerUser): Breadcrumb[] {
  return [getUsersBreadcrumb(), getUserBreadcrumb(undefined, user)];
}
