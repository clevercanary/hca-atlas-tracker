import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type Table } from "@tanstack/react-table";

export interface UseSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<AtlasSourceDataset>;
}
