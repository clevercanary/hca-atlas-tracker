import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { Table } from "@tanstack/react-table";

export interface UseIntegratedObjectSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<IntegratedObjectSourceDataset>;
}
