import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { Getter } from "@tanstack/react-table";
import { ComponentProps } from "react";
import { CAP_INGEST_STATUS_COLOR, CAP_INGEST_STATUS_LABEL } from "./constants";
import { Props } from "./entities";

/**
 * Build props for the CAP ingest status ChipCell component.
 * @param cellContext - Cell context.
 * @param cellContext.row - Row.
 * @returns Props to be used for the ChipCell component.
 */
export function buildCAPIngestStatus({
  row,
}: Pick<Props, "row">): ComponentProps<typeof ChipCell> {
  const status = row.original.capIngestStatus;
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
