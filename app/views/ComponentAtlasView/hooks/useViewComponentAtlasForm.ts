import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { getCapIngestStatus } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ViewIntegratedObjectData } from "../common/entities";
import { viewIntegratedObjectSchema } from "../common/schema";
import { useFetchComponentAtlas } from "./useFetchComponentAtlas";

const SCHEMA = viewIntegratedObjectSchema;

export const useViewComponentAtlasForm = (
  pathParameter: PathParameter
): FormMethod<ViewIntegratedObjectData, HCAAtlasTrackerComponentAtlas> => {
  const { componentAtlas } = useFetchComponentAtlas(pathParameter);
  return useForm<ViewIntegratedObjectData, HCAAtlasTrackerComponentAtlas>(
    SCHEMA,
    componentAtlas,
    mapSchemaValues
  );
};

/**
 * Returns schema default values mapped from integrated object.
 * @param integratedObject - Integrated object.
 * @returns schema default values.
 */
function mapSchemaValues(
  integratedObject?: HCAAtlasTrackerComponentAtlas
): ViewIntegratedObjectData | undefined {
  if (!integratedObject) return;
  return {
    [FIELD_NAME.CAP_INGEST_STATUS]: getCapIngestStatus(integratedObject),
    [FIELD_NAME.CELL_COUNT]: integratedObject.cellCount,
    [FIELD_NAME.FILE_EVENT_TIME]: integratedObject.fileEventTime,
    [FIELD_NAME.FILE_NAME]: integratedObject.fileName,
    [FIELD_NAME.GENE_COUNT]: integratedObject.geneCount ?? undefined,
    [FIELD_NAME.SIZE_BY_BYTES]: formatFileSize(integratedObject.sizeBytes),
    [FIELD_NAME.TITLE]: integratedObject.title,
    [FIELD_NAME.VALIDATION_STATUS]: integratedObject.validationStatus,
  };
}
