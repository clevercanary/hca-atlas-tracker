import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns a map of source study ID to publication string, with UNSPECIFIED option included.
 * @param sourceStudies - Source studies.
 * @returns Map of source study ID to publication string, with UNSPECIFIED option included.
 */
export function buildPublicationStringMap(
  sourceStudies?: HCAAtlasTrackerSourceStudy[],
): Map<string, string> {
  const publicationStringById = (sourceStudies || []).reduce(
    (acc, sourceStudy) => {
      acc.set(sourceStudy.id, getSourceStudyCitation(sourceStudy));
      return acc;
    },
    new Map<string, string>(),
  );

  // Append the UNSPECIFIED option to the map.
  publicationStringById.set(LABEL.UNSPECIFIED, LABEL.UNSPECIFIED);

  return publicationStringById;
}

/**
 * Returns a list of [id, publicationString] tuples sorted by publication string.
 * @param publicationStringById - Map of source study ID to publication string.
 * @returns List of [id, publicationString] tuples sorted by publication string.
 */
export function getPublicationStringOptions(
  publicationStringById: Map<string, string>,
): [string, string][] {
  return [...publicationStringById].sort(sortPublication);
}

/**
 * Sorts [id, publicationString] tuples by publication string.
 * @param a - First [id, publicationString] tuple.
 * @param b - Second [id, publicationString] tuple.
 * @returns -1 if a < b, 1 if a > b, 0 if a === b.
 */
function sortPublication(a: [string, string], b: [string, string]): number {
  return COLLATOR_CASE_INSENSITIVE.compare(a[1], b[1]);
}
