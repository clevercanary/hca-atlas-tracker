import { HCAAtlasTrackerSourceDataset } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../hooks/useForm/common/entities";
import { useForm } from "../../../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ComponentAtlasSourceDatasetsEditData } from "../common/entities";
import { componentAtlasSourceDatasetsEditSchema } from "../common/schema";

const SCHEMA = componentAtlasSourceDatasetsEditSchema;

export const useComponentAtlasSourceDatasetsSelectionForm = (
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[],
): FormMethod<
  ComponentAtlasSourceDatasetsEditData,
  HCAAtlasTrackerSourceDataset[]
> => {
  return useForm(
    SCHEMA,
    componentAtlasSourceDatasets,
    mapSchemaValues,
    undefined,
    { defaultValues: mapSchemaValues(componentAtlasSourceDatasets) },
  );
};

/**
 * Returns source dataset IDs from component atlas source datasets.
 * @param componentAtlasSourceDatasets - Component atlas source datasets.
 * @returns source dataset IDs.
 */
function getSourceDatasetIds(
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[],
): string[] {
  return (componentAtlasSourceDatasets || []).map(({ id }) => id);
}

/**
 * Returns schema default values mapped from component atlas source datasets.
 * @param componentAtlasSourceDatasets - Component atlas source datasets.
 * @returns schema default values.
 */
function mapSchemaValues(
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[],
): ComponentAtlasSourceDatasetsEditData {
  return {
    [FIELD_NAME.SOURCE_DATASET_IDS]: getSourceDatasetIds(
      componentAtlasSourceDatasets,
    ),
  };
}
