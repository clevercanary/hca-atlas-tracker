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
 * Returns schema default values mapped from source dataset.
 * @param sourceDataset - Source dataset.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): SourceDatasetEditData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.DOI]: sourceDataset.doi ?? "",
    [FIELD_NAME.TITLE]: sourceDataset.title ?? "",
  };
}
