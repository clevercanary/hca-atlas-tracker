import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { JSX } from "react";
import { Props } from "./entities";
import { buildCAPIngestStatus } from "./utils";

export const CAPIngestStatusCell = ({ row }: Props): JSX.Element | null => {
  return <ChipCell {...buildCAPIngestStatus({ row })} />;
};
