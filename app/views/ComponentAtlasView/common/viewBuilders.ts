import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import {
  FILE_VALIDATION_STATUS_NAME_LABEL,
  UNPUBLISHED,
} from "../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  CAP_INGEST_STATUS,
  FILE_VALIDATION_STATUS,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Props } from "../../../components/Form/components/Input/inputComponent/Chip/types";
import {
  CAP_INGEST_STATUS_COLOR,
  CAP_INGEST_STATUS_LABEL,
} from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/constants";
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
 * Build props for the release date input component. Returns chip props (the
 * `Draft` status pill) when the value is the `UNPUBLISHED` sentinel; otherwise
 * undefined so the input falls back to rendering the raw value as text.
 * @param value - Release date, or the `UNPUBLISHED` sentinel when no release date is set.
 * @returns Chip props for the unpublished case, or undefined when a release date is set.
 */
export function buildReleaseDate(value: unknown): Props["viewProps"] {
  if (value === UNPUBLISHED) {
    return {
      color: STATUS_BADGE_COLOR.INFO,
      label: "Draft",
      variant: CHIP_PROPS.VARIANT.STATUS,
    };
  }
  return undefined;
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
