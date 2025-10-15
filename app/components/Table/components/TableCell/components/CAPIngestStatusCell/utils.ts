import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { Getter } from "@tanstack/react-table";
import { ComponentProps } from "react";
import { REPROCESSED_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
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
  const { original } = row;
  const { validationStatus } = original;

  // Determine CAP ingest status.
  let status: CAP_INGEST_STATUS = validationStatus;
  // Status is "NOT_REQUIRED" for reprocessed source datasets.
  if (
    "reprocessedStatus" in original &&
    original.reprocessedStatus === REPROCESSED_STATUS.REPROCESSED
  ) {
    status = "NOT_REQUIRED";
  }

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
