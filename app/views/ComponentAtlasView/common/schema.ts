import { array, number, object, string } from "yup";
import { CAP_INGEST_STATUS } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/entities";
import { FIELD_NAME } from "./constants";

export const componentAtlasDeleteSourceDatasetsSchema = object({
  [FIELD_NAME.SOURCE_DATASET_IDS]: array()
    .of(string().required().min(1))
    .default([]),
}).strict(true);

export const viewIntegratedObjectSchema = object({
  [FIELD_NAME.CAP_INGEST_STATUS]: string().oneOf(
    Object.values(CAP_INGEST_STATUS)
  ),
  [FIELD_NAME.CELL_COUNT]: number().strict(false),
  [FIELD_NAME.FILE_EVENT_TIME]: string(),
  [FIELD_NAME.FILE_NAME]: string(),
  [FIELD_NAME.SIZE_BY_BYTES]: string(),
  [FIELD_NAME.TITLE]: string(),
  [FIELD_NAME.VALIDATION_STATUS]: string(),
}).strict(true);
