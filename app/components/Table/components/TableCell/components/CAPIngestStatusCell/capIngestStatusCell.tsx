import { JSX } from "react";
import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { Props } from "./entities";
import { buildCAPIngestStatus } from "./utils";

export const CAPIngestStatusCell = ({ row }: Props): JSX.Element | null => {
  return <ChipCell {...buildCAPIngestStatus({ row })} />;
};
