import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
} from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../../../../common/entities";
import { getRouteURL } from "../../../../../../../common/utils";
import { isRouteValue } from "../../../../../../../routes/utils";
import { Breadcrumb } from "../breadcrumbs";
import {
  BREADCRUMB_ATLAS,
  BREADCRUMB_ATLAS_SOURCE_DATASET,
  BREADCRUMB_ATLAS_SOURCE_DATASET_VALIDATIONS,
  BREADCRUMB_ATLAS_SOURCE_DATASETS,
  BREADCRUMB_ATLASES,
  BREADCRUMB_COMPONENT_ATLAS,
  BREADCRUMB_COMPONENT_ATLASES,
  BREADCRUMB_METADATA_CORRECTNESS,
  BREADCRUMB_METADATA_ENTRY_SHEETS,
  BREADCRUMB_SOURCE_DATASETS,
  BREADCRUMB_SOURCE_STUDIES,
  BREADCRUMB_SOURCE_STUDY,
  BREADCRUMB_USER,
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
 * Returns the breadcrumb for the atlas source datasets view.
 * @param pathParameter - Path parameter.
 * @returns atkas source datasets view breadcrumb.
 */
export function getAtlasSourceDatasetsBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_ATLAS_SOURCE_DATASETS, pathParameter);
}

/**
 * Returns the breadcrumb for the atlas source dataset view.
 * @param pathParameter - Path parameter.
 * @returns atlas source dataset view breadcrumb.
 */
export function getAtlasSourceDatasetBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_ATLAS_SOURCE_DATASET, pathParameter);
}

/**
 * Returns the breadcrumb for the atlas source dataset validations view.
 * @param pathParameter - Path parameter.
 * @returns atlas source dataset validations view breadcrumb.
 */
export function getAtlasSourceDatasetValidationsBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(
    BREADCRUMB_ATLAS_SOURCE_DATASET_VALIDATIONS,
    pathParameter
  );
}

/**
 * Returns the breadcrumb for the component atlases view.
 * @param pathParameter - Path parameter.
 * @returns component atlases view breadcrumb.
 */
export function getComponentAtlasesBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_COMPONENT_ATLASES, pathParameter);
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
 * Returns the breadcrumb for the metadata correctness view.
 * @param pathParameter - Path parameter.
 * @returns metadata correctness view breadcrumb.
 */
export function getMetadataCorrectnessBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_METADATA_CORRECTNESS, pathParameter);
}

/**
 * Returns the breadcrumb for the metadata entry sheets view.
 * @param pathParameter - Path parameter.
 * @returns metadata entry sheets view breadcrumb.
 */
export function getMetadataEntrySheetsBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_METADATA_ENTRY_SHEETS, pathParameter);
}

/**
 * Returns the breadcrumb for the source studies view.
 * @param pathParameter - Path parameter.
 * @returns source studies view breadcrumb.
 */
export function getSourceStudiesBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_SOURCE_STUDIES, pathParameter);
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
 * Returns the breadcrumb for the source datasets view.
 * @param pathParameter - Path parameter.
 * @returns source datasets view breadcrumb.
 */
export function getSourceDatasetsBreadcrumb(
  pathParameter?: PathParameter
): Breadcrumb {
  return resolveBreadcrumbPath(BREADCRUMB_SOURCE_DATASETS, pathParameter);
}

/**
 * Returns the breadcrumb for the user view.
 * @param pathParameter - Path parameter.
 * @param user - User.
 * @returns user view breadcrumb.
 */
export function getUserBreadcrumb(
  pathParameter?: PathParameter,
  user?: HCAAtlasTrackerUser
): Breadcrumb {
  const breadcrumb = resolveBreadcrumbPath(BREADCRUMB_USER, pathParameter);
  if (!user) return breadcrumb;
  return { ...breadcrumb, text: user.fullName };
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
