import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { buildSheetsUrl } from "@/app/utils/google-sheets";
import { PUBLICATION_STATUS } from "@/app/views/AddNewSourceStudyView/common/entities";
import { FIELD_NAME } from "@/app/views/SourceStudyView/common/constants";
import { SourceStudyEditData } from "@/app/views/SourceStudyView/common/entities";
import { sourceStudyEditSchema } from "@/app/views/SourceStudyView/common/schema";
import {
  ATLAS_ECOSYSTEM_PATHS,
  ATLAS_ECOSYSTEM_URLS,
} from "@/site-config/common/constants";
import { useFetchSourceStudy } from "./UseFetchSourceStudy/hook";

const SCHEMA = sourceStudyEditSchema;

export const useEditSourceStudyForm = (
  pathParameter: PathParameter,
): FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy> => {
  const { data: sourceStudy } = useFetchSourceStudy(pathParameter);
  return useForm<SourceStudyEditData, HCAAtlasTrackerSourceStudy>(
    SCHEMA,
    sourceStudy,
    mapSchemaValues,
    undefined,
    { defaultValues: mapSchemaValues(sourceStudy) },
  );
};

/**
 * Maps CELLxGENE collection ID to URL.
 * @param cellxgeneCollectionId - CELLxGENE collection ID.
 * @returns URL.
 */
function mapCELLxGENECollectionId(
  cellxgeneCollectionId: string | null,
): string {
  if (!cellxgeneCollectionId) return "";
  return `${ATLAS_ECOSYSTEM_URLS.CELLXGENE_PORTAL}${ATLAS_ECOSYSTEM_PATHS.CELLXGENE_COLLECTION}/${cellxgeneCollectionId}`;
}

/**
 * Maps HCA project ID to URL.
 * @param hcaProjectId - HCA project ID.
 * @returns URL.
 */
function mapHCAProjectId(hcaProjectId: string | null): string {
  if (!hcaProjectId) return "";
  return `${ATLAS_ECOSYSTEM_URLS.HCA_EXPLORER}${ATLAS_ECOSYSTEM_PATHS.HCA_PROJECT}/${hcaProjectId}`;
}

/**
 * Maps publication status.
 * @param doi - DOI.
 * @returns publication status.
 */
export function mapPublicationStatus(doi?: string | null): PUBLICATION_STATUS {
  return doi
    ? PUBLICATION_STATUS.PUBLISHED_PREPRINT
    : PUBLICATION_STATUS.NO_DOI;
}

/**
 * Returns schema default values mapped from source study.
 * @param sourceStudy - Source study.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceStudy?: HCAAtlasTrackerSourceStudy,
): SourceStudyEditData {
  return {
    capId: null, // TODO remove when capId is removed from BE.
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: mapCELLxGENECollectionId(
      sourceStudy?.cellxgeneCollectionId ?? null,
    ),
    [FIELD_NAME.CONTACT_EMAIL]: sourceStudy?.contactEmail ?? "",
    [FIELD_NAME.DOI]: sourceStudy?.doi ?? "",
    [FIELD_NAME.HCA_PROJECT_ID]: mapHCAProjectId(
      sourceStudy?.hcaProjectId ?? null,
    ),
    [FIELD_NAME.METADATA_SPREADSHEETS]:
      sourceStudy?.metadataSpreadsheets.map(({ id, ...props }) => ({
        url: buildSheetsUrl(id),
        ...props,
      })) ?? [],
    [FIELD_NAME.PUBLICATION_STATUS]: mapPublicationStatus(sourceStudy?.doi),
    [FIELD_NAME.REFERENCE_AUTHOR]: sourceStudy?.referenceAuthor ?? "",
    [FIELD_NAME.TITLE]: sourceStudy?.title ?? "",
  };
}
