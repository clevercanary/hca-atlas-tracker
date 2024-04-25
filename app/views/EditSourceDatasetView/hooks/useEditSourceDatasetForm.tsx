import {
  ALTAS_ECOSYSTEM_PATHS,
  ATLAS_ECOSYSTEM_URLS,
} from "../../../../site-config/common/constants";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
  SourceDatasetId,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  SourceDatasetEditData,
  sourceDatasetEditSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FIELD_NAME } from "../../../components/Detail/components/TrackerForm/components/Section/components/SourceDataset/common/constants";
import { useFetchSourceDataset } from "../../../hooks/useFetchSourceDataset";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";

const SCHEMA = sourceDatasetEditSchema;

export const useEditSourceDatasetForm = (
  atlasId: AtlasId,
  sdId: SourceDatasetId
): FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset> => {
  const { sourceDataset } = useFetchSourceDataset(atlasId, sdId);
  return useForm<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>(
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
 * Returns schema default values mapped from source dataset.
 * @param sourceDataset - Source dataset.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): SourceDatasetEditData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.AUTHOR]: sourceDataset.referenceAuthor ?? "",
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: mapCELLxGENECollectionId(
      sourceDataset.cellxgeneCollectionId
    ),
    [FIELD_NAME.CONTACT_EMAIL]: sourceDataset.contactEmail ?? "",
    [FIELD_NAME.DOI]: sourceDataset.doi ?? "",
    [FIELD_NAME.HCA_PROJECT_ID]: mapHCAProjectId(sourceDataset.hcaProjectId),
    [FIELD_NAME.TITLE]: sourceDataset.title ?? "",
  };
}
