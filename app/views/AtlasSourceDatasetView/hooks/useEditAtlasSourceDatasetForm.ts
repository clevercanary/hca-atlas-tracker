import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { AtlasSourceDatasetEditData } from "../common/entities";
import { atlasSourceDatasetEditSchema } from "../common/schema";
import { useFetchAtlasSourceDataset } from "./useFetchAtlasSourceDataset";

const SCHEMA = atlasSourceDatasetEditSchema;

export const useEditAtlasSourceDatasetForm = (
  pathParameter: PathParameter
): FormMethod<AtlasSourceDatasetEditData, HCAAtlasTrackerSourceDataset> => {
  const { sourceDataset } = useFetchAtlasSourceDataset(pathParameter);
  return useForm<AtlasSourceDatasetEditData, HCAAtlasTrackerSourceDataset>(
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
): AtlasSourceDatasetEditData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.METADATA_SPREADSHEET_URL]:
      sourceDataset.metadataSpreadsheetUrl ?? "",
  };
}
