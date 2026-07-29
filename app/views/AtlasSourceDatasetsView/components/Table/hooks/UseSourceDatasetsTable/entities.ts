import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { Table } from "@tanstack/react-table";

export interface UseSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<AtlasSourceDataset>;
}
