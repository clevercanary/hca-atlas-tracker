import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { Getter } from "@tanstack/react-table";
import { ComponentProps } from "react";
import { FILE_VALIDATION_STATUS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { VALIDATION_STATUS_COLOR } from "./constants";

/**
 * Build props for the validation status ChipCell component.
 * @param validationStatus - Validation status.
 * @returns Props to be used for the ChipCell component.
 */
export function buildValidationStatus(
  validationStatus: FILE_VALIDATION_STATUS
): ComponentProps<typeof ChipCell> {
  return {
    getValue: (() => {
      return {
        color: VALIDATION_STATUS_COLOR[validationStatus],
        label: validationStatus
          .replaceAll("_", " ")
          .replace(/^./, (match) => match.toUpperCase()),
        variant: CHIP_PROPS.VARIANT.STATUS,
      };
    }) as Getter<ChipProps>,
  } as ComponentProps<typeof ChipCell>;
}
