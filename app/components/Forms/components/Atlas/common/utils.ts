import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getPublicationCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { getDOILink } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

/**
 * Returns the DOI link URL for the DOI field label.
 * @param doi - DOI.
 * @returns DOI URL, or null when the DOI has no link.
 */
export function getDOIUrl(doi: string | null): string | null {
  return getDOILink(doi) || null;
}

/**
 * Returns the helper text for the CELLxGENE collection ID field.
 * @param atlas - Atlas.
 * @returns CELLxGENE collection title; null when the atlas has none, undefined when there is no atlas.
 */
export function renderCellxGeneCollectionHelperText(
  atlas?: HCAAtlasTrackerAtlas,
): string | null | undefined {
  return atlas?.cellxgeneAtlasCollectionTitle;
}

/**
 * Returns the helper text for the DOI field.
 * @param atlas - Atlas.
 * @returns citation of the atlas's first publication, or an empty string when there is none.
 */
export function renderDOIHelperText(atlas?: HCAAtlasTrackerAtlas): string {
  const publication = atlas?.publications[0];
  return publication ? getPublicationCitation(publication) : "";
}

/**
 * Returns the helper text for the metadata specification URL field.
 * @param atlas - Atlas.
 * @returns metadata specification title; null when the atlas has none, undefined when there is no atlas.
 */
export function renderMetadataSpecificationHelperText(
  atlas?: HCAAtlasTrackerAtlas,
): string | null | undefined {
  return atlas?.metadataSpecificationTitle;
}
