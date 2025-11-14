import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FILE_VALIDATION_STATUS } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Props } from "../../../components/Form/components/Input/inputComponent/Chip/types";
import {
  CAP_INGEST_STATUS_COLOR,
  CAP_INGEST_STATUS_LABEL,
} from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/constants";
import { CAP_INGEST_STATUS } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/entities";
import { VALIDATION_STATUS_COLOR } from "../../../components/Table/components/TableCell/components/ValidationStatusCell/components/ValidationStatus/constants";

/**
 * Build props for the CAP ingest status Chip component.
 * @param value - CAP ingest status.
 * @returns Props to be used for the Chip component.
 */
export function buildCAPIngestStatus(value: unknown): Props["viewProps"] {
  const status = value as CAP_INGEST_STATUS;
  return {
    color: CAP_INGEST_STATUS_COLOR[status],
    label: CAP_INGEST_STATUS_LABEL[status],
    variant: CHIP_PROPS.VARIANT.STATUS,
  };
}

/**
 * Build props for the validation status Chip component.
 * @param value - Validation status.
 * @returns Props to be used for the Chip component.
 */
export function buildValidationStatus(value: unknown): Props["viewProps"] {
  const validationStatus = value as FILE_VALIDATION_STATUS;
  return {
    color: VALIDATION_STATUS_COLOR[validationStatus],
    label: FILE_VALIDATION_STATUS_NAME_LABEL[validationStatus],
    variant: CHIP_PROPS.VARIANT.STATUS,
  };
}
