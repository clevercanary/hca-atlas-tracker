import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ViewAtlasSourceDatasetData } from "../common/entities";
import { viewAtlasSourceDatasetSchema } from "../common/schema";
import { useFetchAtlasSourceDataset } from "./useFetchAtlasSourceDataset";

const SCHEMA = viewAtlasSourceDatasetSchema;

export const useEditAtlasSourceDatasetForm = (
  pathParameter: PathParameter
): FormMethod<ViewAtlasSourceDatasetData, HCAAtlasTrackerSourceDataset> => {
  const { sourceDataset } = useFetchAtlasSourceDataset(pathParameter);
  return useForm<ViewAtlasSourceDatasetData, HCAAtlasTrackerSourceDataset>(
    SCHEMA,
    sourceDataset,
    mapSchemaValues
  );
};

/**
 * Returns schema default values mapped from component atlas.
 * @param sourceDataset - Component atlas.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): ViewAtlasSourceDatasetData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.CAP_URL]: sourceDataset.capUrl,
    [FIELD_NAME.FILE_NAME]: sourceDataset.fileName,
    [FIELD_NAME.SIZE_BYTES]: formatFileSize(sourceDataset.sizeBytes),
    [FIELD_NAME.VALIDATION_STATUS]:
      FILE_VALIDATION_STATUS_NAME_LABEL[sourceDataset.validationStatus],
  };
}
