import { Table } from "@tanstack/react-table";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { AtlasSourceDataset } from "../../../../entities";

export interface UseSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<AtlasSourceDataset>;
}
