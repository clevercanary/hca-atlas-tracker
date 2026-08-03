import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { type Table } from "@tanstack/react-table";

export interface UseIntegratedObjectSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<IntegratedObjectSourceDataset>;
}
