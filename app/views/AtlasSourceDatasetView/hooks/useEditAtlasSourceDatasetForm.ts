import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getApiEntityFileVersion } from "../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../common/entities";
import { getCapIngestStatus } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ViewAtlasSourceDatasetData } from "../common/entities";
import { viewAtlasSourceDatasetSchema } from "../common/schema";
import { useFetchAtlasSourceDataset } from "./useFetchAtlasSourceDataset";

const SCHEMA = viewAtlasSourceDatasetSchema;

export const useEditAtlasSourceDatasetForm = (
  pathParameter: PathParameter,
): FormMethod<ViewAtlasSourceDatasetData, HCAAtlasTrackerSourceDataset> => {
  const { sourceDataset } = useFetchAtlasSourceDataset(pathParameter);
  return useForm<ViewAtlasSourceDatasetData, HCAAtlasTrackerSourceDataset>(
    SCHEMA,
    sourceDataset,
    mapSchemaValues,
  );
};

/**
 * Returns schema default values mapped from component atlas.
 * @param sourceDataset - Component atlas.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset,
): ViewAtlasSourceDatasetData | undefined {
  if (!sourceDataset) return;
  return {
    [FIELD_NAME.CAP_INGEST_STATUS]: getCapIngestStatus(sourceDataset),
    [FIELD_NAME.CAP_URL]: sourceDataset.capUrl,
    [FIELD_NAME.CELL_COUNT]: sourceDataset.cellCount,
    [FIELD_NAME.FILE_EVENT_TIME]: sourceDataset.fileEventTime,
    [FIELD_NAME.FILE_NAME]: sourceDataset.baseFileName,
    [FIELD_NAME.GENE_COUNT]: sourceDataset.geneCount,
    [FIELD_NAME.PUBLICATION_STATUS]: sourceDataset.publicationStatus,
    [FIELD_NAME.SIZE_BYTES]: formatFileSize(sourceDataset.sizeBytes),
    [FIELD_NAME.TITLE]: sourceDataset.title,
    [FIELD_NAME.VALIDATION_STATUS]: sourceDataset.validationStatus,
    [FIELD_NAME.VERSION]: getApiEntityFileVersion(sourceDataset),
  };
}
