import { HCAAtlasTrackerComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getApiEntityFileVersion,
  getCapIngestStatus,
} from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { FIELD_NAME } from "@/app/views/ComponentAtlasView/common/constants";
import { ViewIntegratedObjectData } from "@/app/views/ComponentAtlasView/common/entities";
import { viewIntegratedObjectSchema } from "@/app/views/ComponentAtlasView/common/schema";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { useFetchComponentAtlas } from "./UseFetchComponentAtlas/hook";

const SCHEMA = viewIntegratedObjectSchema;

export const useViewComponentAtlasForm = (
  pathParameter: PathParameter,
): FormMethod<ViewIntegratedObjectData, HCAAtlasTrackerComponentAtlas> => {
  const { data: componentAtlas } = useFetchComponentAtlas(pathParameter);
  return useForm<ViewIntegratedObjectData, HCAAtlasTrackerComponentAtlas>(
    SCHEMA,
    componentAtlas,
    mapSchemaValues,
  );
};

/**
 * Returns schema default values mapped from integrated object.
 * @param integratedObject - Integrated object.
 * @returns schema default values.
 */
function mapSchemaValues(
  integratedObject?: HCAAtlasTrackerComponentAtlas,
): ViewIntegratedObjectData {
  if (!integratedObject) return { capUrl: null, downloadName: "" };
  return {
    [FIELD_NAME.CAP_INGEST_STATUS]: getCapIngestStatus(integratedObject),
    [FIELD_NAME.CAP_URL]: integratedObject.capUrl,
    [FIELD_NAME.CELL_COUNT]: integratedObject.cellCount,
    [FIELD_NAME.DOWNLOAD_NAME]: integratedObject.downloadName,
    [FIELD_NAME.FILE_EVENT_TIME]: integratedObject.fileEventTime,
    [FIELD_NAME.FILE_NAME]: integratedObject.fileName,
    [FIELD_NAME.GENE_COUNT]: integratedObject.geneCount,
    [FIELD_NAME.PUBLISHED_AT]: integratedObject.publishedAt ?? "Unpublished",
    [FIELD_NAME.SIZE_BY_BYTES]: formatFileSize(integratedObject.sizeBytes),
    [FIELD_NAME.TITLE]: integratedObject.title,
    [FIELD_NAME.VALIDATION_STATUS]: integratedObject.validationStatus,
    [FIELD_NAME.VERSION]: getApiEntityFileVersion(integratedObject),
  };
}
