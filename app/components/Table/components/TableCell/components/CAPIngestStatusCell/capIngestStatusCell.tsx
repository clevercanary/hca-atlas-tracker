import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { Tooltip } from "@mui/material";
import { JSX } from "react";
import { CAP_INGEST_STATUS_TOOLTIP } from "./constants";
import { Props } from "./entities";
import { buildCAPIngestStatus } from "./utils";

export const CAPIngestStatusCell = ({ row }: Props): JSX.Element | null => {
  const status = row.original.capIngestStatus;
  const tooltip = CAP_INGEST_STATUS_TOOLTIP[status];
  const chipCell = <ChipCell {...buildCAPIngestStatus({ row })} />;
  if (!tooltip) return chipCell;
  return <Tooltip title={tooltip}>{chipCell}</Tooltip>;
};
