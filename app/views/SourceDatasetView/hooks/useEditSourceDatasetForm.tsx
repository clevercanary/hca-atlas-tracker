import {
  ALTAS_ECOSYSTEM_PATHS,
  ATLAS_ECOSYSTEM_URLS,
} from "../../../../site-config/common/constants";
import {
  AtlasId,
  HCAAtlasTrackerSourceStudy,
  SourceStudyId,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchSourceDataset } from "../../../hooks/useFetchSourceDataset";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { PUBLICATION_STATUS } from "../../AddNewSourceDatasetView/common/entities";
import { FIELD_NAME } from "../common/constants";
import { SourceStudyEditData } from "../common/entities";
import { sourceStudyEditSchema } from "../common/schema";

const SCHEMA = sourceStudyEditSchema;

export const useEditSourceDatasetForm = (
  atlasId: AtlasId,
  sourceStudyId: SourceStudyId
): FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy> => {
  const { sourceDataset } = useFetchSourceDataset(atlasId, sourceStudyId);
  return useForm<SourceStudyEditData, HCAAtlasTrackerSourceStudy>(
    SCHEMA,
    sourceDataset,
    mapSchemaValues
  );
};

/**
 * Maps CELLxGENE collection ID to URL.
 * @param cellxgeneCollectionId - CELLxGENE collection ID.
 * @returns URL.
 */
function mapCELLxGENECollectionId(
  cellxgeneCollectionId: string | null
): string {
  if (!cellxgeneCollectionId) return "";
  return `${ATLAS_ECOSYSTEM_URLS.CELLXGENE_PORTAL}${ALTAS_ECOSYSTEM_PATHS.CELLXGENE_COLLECTION}/${cellxgeneCollectionId}`;
}

/**
 * Maps HCA project ID to URL.
 * @param hcaProjectId - HCA project ID.
 * @returns URL.
 */
function mapHCAProjectId(hcaProjectId: string | null): string {
  if (!hcaProjectId) return "";
  return `${ATLAS_ECOSYSTEM_URLS.HCA_EXPLORER}${ALTAS_ECOSYSTEM_PATHS.HCA_PROJECT}/${hcaProjectId}`;
}

/**
 * Maps publication status.
 * @param doi - DOI.
 * @returns publication status.
 */
export function mapPublicationStatus(doi?: string | null): PUBLICATION_STATUS {
  return doi ? PUBLICATION_STATUS.PUBLISHED : PUBLICATION_STATUS.UNPUBLISHED;
}

/**
 * Returns schema default values mapped from source dataset.
 * @param sourceDataset - Source dataset.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceStudy
): SourceStudyEditData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.CAP_ID]: sourceDataset.capId ?? "",
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: mapCELLxGENECollectionId(
      sourceDataset.cellxgeneCollectionId
    ),
    [FIELD_NAME.CONTACT_EMAIL]: sourceDataset.contactEmail ?? "",
    [FIELD_NAME.DOI]: sourceDataset.doi ?? "",
    [FIELD_NAME.HCA_PROJECT_ID]: mapHCAProjectId(sourceDataset.hcaProjectId),
    [FIELD_NAME.PUBLICATION_STATUS]: mapPublicationStatus(sourceDataset.doi),
    [FIELD_NAME.REFERENCE_AUTHOR]: sourceDataset.referenceAuthor ?? "",
    [FIELD_NAME.TITLE]: sourceDataset.title ?? "",
  };
}
