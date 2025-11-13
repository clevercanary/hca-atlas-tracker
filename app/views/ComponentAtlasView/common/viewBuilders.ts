import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { Chip } from "@mui/material";
import { ComponentProps } from "react";
import {
  CAP_INGEST_STATUS_COLOR,
  CAP_INGEST_STATUS_LABEL,
} from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/constants";
import { CAP_INGEST_STATUS } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/entities";

/**
 * Build props for the CAP ingest status Chip component.
 * @param value - CAP ingest status.
 * @returns Props to be used for the Chip component.
 */
export function buildCAPIngestStatus(
  value: unknown
): ComponentProps<typeof Chip> {
  const status = value as CAP_INGEST_STATUS;
  return {
    color: CAP_INGEST_STATUS_COLOR[status],
    label: CAP_INGEST_STATUS_LABEL[status],
    variant: CHIP_PROPS.VARIANT.STATUS,
  };
}
