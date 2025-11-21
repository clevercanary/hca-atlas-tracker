import { number, object, string } from "yup";
import { PUBLICATION_STATUS } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { CAP_DATASET_URL_REGEXP } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { CAP_INGEST_STATUS } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/entities";
import { FIELD_NAME } from "./constants";

export const viewAtlasSourceDatasetSchema = object({
  [FIELD_NAME.CAP_INGEST_STATUS]: string().oneOf(
    Object.values(CAP_INGEST_STATUS)
  ),
  [FIELD_NAME.CAP_URL]: string()
    .default(null)
    .matches(CAP_DATASET_URL_REGEXP, "Invalid CAP URL (must be a dataset URL)")
    .nullable(),
  [FIELD_NAME.CELL_COUNT]: number(),
  [FIELD_NAME.FILE_EVENT_TIME]: string(),
  [FIELD_NAME.FILE_NAME]: string(),
  [FIELD_NAME.GENE_COUNT]: number().nullable(),
  [FIELD_NAME.PUBLICATION_STATUS]: string().oneOf(
    Object.values(PUBLICATION_STATUS)
  ),
  [FIELD_NAME.SIZE_BYTES]: string(),
  [FIELD_NAME.TITLE]: string(),
  [FIELD_NAME.VALIDATION_STATUS]: string(),
}).strict(true);
