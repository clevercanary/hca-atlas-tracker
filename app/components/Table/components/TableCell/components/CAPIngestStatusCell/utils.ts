import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { Getter } from "@tanstack/react-table";
import { ComponentProps } from "react";
import {
  FILE_VALIDATION_STATUS,
  REPROCESSED_STATUS,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { CAP_INGEST_STATUS_COLOR, CAP_INGEST_STATUS_LABEL } from "./constants";
import { CAP_INGEST_STATUS, Props } from "./entities";

/**
 * Build props for the CAP ingest status ChipCell component.
 * @param cellContext - Cell context.
 * @param cellContext.row - Row.
 * @returns Props to be used for the ChipCell component.
 */
export function buildCAPIngestStatus({
  row,
}: Pick<Props, "row">): ComponentProps<typeof ChipCell> {
  // Determine CAP ingest status.
  const status = getCapIngestStatus({ row });
  return {
    getValue: (() => {
      return {
        color: CAP_INGEST_STATUS_COLOR[status],
        label: CAP_INGEST_STATUS_LABEL[status],
        variant: CHIP_PROPS.VARIANT.STATUS,
      };
    }) as Getter<ChipProps>,
  } as ComponentProps<typeof ChipCell>;
}

/**
 * Determine CAP ingest status.
 * @param cellContext - CellContext.
 * @param cellContext.row - Row.
 * @returns CAP ingest status.
 */
function getCapIngestStatus({ row }: Pick<Props, "row">): CAP_INGEST_STATUS {
  const { original } = row;
  const { validationStatus, validationSummary } = original;

  // Determine CAP ingest status for source datasets with reprocessed status of "REPROCESSED" or "UNSPECIFIED".
  if ("reprocessedStatus" in original) {
    if (original.reprocessedStatus === REPROCESSED_STATUS.REPROCESSED) {
      // Status is "NOT_REQUIRED" for reprocessed source datasets.
      return CAP_INGEST_STATUS.NOT_REQUIRED;
    }
    if (original.reprocessedStatus === REPROCESSED_STATUS.UNSPECIFIED) {
      // Status is "UPDATES_REQUIRED" for unspecified source datasets.
      return CAP_INGEST_STATUS.UPDATES_REQUIRED;
    }
  }

  // Determine CAP ingest status with validation status of "COMPLETED".
  if (validationStatus === FILE_VALIDATION_STATUS.COMPLETED) {
    // No validation summary available.
    if (!validationSummary) {
      return CAP_INGEST_STATUS.NEEDS_VALIDATION;
    }
    // Status is "CAP_READY" with completed, successful validation.
    if (validationSummary.validators.cap) {
      return CAP_INGEST_STATUS.CAP_READY;
    }
    // Status is "UPDATES_REQUIRED" with completed validation with errors.
    return CAP_INGEST_STATUS.UPDATES_REQUIRED;
  }

  return CAP_INGEST_STATUS.NEEDS_VALIDATION;
}
