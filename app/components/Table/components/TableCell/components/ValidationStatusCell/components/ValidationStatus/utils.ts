import { FILE_VALIDATION_STATUS_NAME_LABEL } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { FILE_VALIDATION_STATUS } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { ChipProps } from "@mui/material";
import { VALIDATION_STATUS_COLOR } from "./constants";

/**
 * Build props for the validation status ValidationStatusChipCell component.
 * @param validationStatus - Validation status.
 * @returns Props to be used for the ValidationStatusChipCell component.
 */
export function buildValidationStatus(
  validationStatus: FILE_VALIDATION_STATUS,
): Pick<ChipProps, "color" | "label"> {
  return {
    color: VALIDATION_STATUS_COLOR[validationStatus],
    label: FILE_VALIDATION_STATUS_NAME_LABEL[validationStatus],
  };
}
