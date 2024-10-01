import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceStudy,
} from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../../../../common/entities";
import { getRouteURL } from "../../../../../../../common/utils";
import { isRouteValue } from "../../../../../../../routes/utils";
import { Breadcrumb } from "../breadcrumbs";
import {
  BREADCRUMB_ATLAS,
  BREADCRUMB_ATLASES,
  BREADCRUMB_COMPONENT_ATLAS,
  BREADCRUMB_SOURCE_STUDY,
  BREADCRUMB_USERS,
} from "./constants";

/**
 * Returns the breadcrumb for the atlas view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @returns atlas view breadcrumb.
 */
export function getAtlasBreadcrumb(
  pathParameter?: PathParameter,
  atlas?: HCAAtlasTrackerAtlas
): Breadcrumb {
  const breadcrumb = resolveBreadcrumbPath(BREADCRUMB_ATLAS, pathParameter);
  if (!atlas) return breadcrumb;
  return { ...breadcrumb, text: getAtlasName(atlas) };
}

/**
 * Returns the breadcrumb for the atlases view.
 * @returns atlases view breadcrumb.
 */
export function getAtlasesBreadcrumb(): Breadcrumb {
  return BREADCRUMB_ATLASES;
}

/**
 * Returns the breadcrumb for the component atlas view.
 * @param pathParameter - Path parameter.
 * @param componentAtlas - Component atlas.
 * @returns component atlas view breadcrumb.
 */
export function getComponentAtlasBreadcrumb(
  pathParameter?: PathParameter,
  componentAtlas?: HCAAtlasTrackerComponentAtlas
): Breadcrumb {
  const breadcrumb = resolveBreadcrumbPath(
    BREADCRUMB_COMPONENT_ATLAS,
    pathParameter
  );
  if (!componentAtlas) return breadcrumb;
  return { ...breadcrumb, text: componentAtlas.title };
}

/**
 * Returns the breadcrumb for the source study view.
 * @param pathParameter - Path parameter.
 * @param sourceStudy - Source study.
 * @returns source study view breadcrumb.
 */
export function getSourceStudyBreadcrumb(
  pathParameter?: PathParameter,
  sourceStudy?: HCAAtlasTrackerSourceStudy
): Breadcrumb {
  const breadcrumb = resolveBreadcrumbPath(
    BREADCRUMB_SOURCE_STUDY,
    pathParameter
  );
  if (!sourceStudy) return breadcrumb;
  return { ...breadcrumb, text: sourceStudy.title };
}

/**
 * Returns the breadcrumb for the users view.
 * @returns users view breadcrumb.
 */
export function getUsersBreadcrumb(): Breadcrumb {
  return BREADCRUMB_USERS;
}

/**
 * Returns the breadcrumb, with path resolved from a ROUTE value to a URL.
 * @param breadcrumb - Breadcrumb.
 * @param pathParameter - Path parameter.
 * @returns breadcrumb.
 */
export function resolveBreadcrumbPath(
  breadcrumb: Breadcrumb,
  pathParameter?: PathParameter
): Breadcrumb {
  if (!pathParameter || !isRouteValue(breadcrumb.path)) {
    return { path: "", text: breadcrumb.text };
  }
  return { ...breadcrumb, path: getRouteURL(breadcrumb.path, pathParameter) };
}
