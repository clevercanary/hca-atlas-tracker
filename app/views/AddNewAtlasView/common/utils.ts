import { Breadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { getAtlasesBreadcrumb } from "../../../components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";

/**
 * Returns the breadcrumbs for the create atlas view.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [getAtlasesBreadcrumb()];
}

/**
 * Returns the identifier URL's ID.
 * @param identifierUrl - Identifier URL.
 * @returns identifier ID.
 */
export function getIdentifierId(identifierUrl: string | null): string | null {
  if (!identifierUrl) return null;
  const paths = identifierUrl.split("/");
  return paths.pop() || "";
}
