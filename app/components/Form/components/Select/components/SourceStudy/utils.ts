import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns a map of source study ID to publication string.
 * @param sourceStudies - Source studies.
 * @returns Map of source study ID to publication string.
 */
export function getPublicationStringById(
  sourceStudies?: HCAAtlasTrackerSourceStudy[]
): Map<string, string> {
  const publicationStringById = (sourceStudies || []).reduce(
    (acc, sourceStudy) => {
      acc.set(sourceStudy.id, getSourceStudyCitation(sourceStudy));
      return acc;
    },
    new Map<string, string>()
  );

  // Append the UNSPECIFIED option.
  publicationStringById.set(LABEL.UNSPECIFIED, LABEL.UNSPECIFIED);

  return publicationStringById;
}
