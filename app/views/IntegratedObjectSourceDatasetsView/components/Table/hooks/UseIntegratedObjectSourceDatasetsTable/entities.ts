import { Table } from "@tanstack/react-table";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { IntegratedObjectSourceDataset } from "../../../../entities";

export interface UseIntegratedObjectSourceDatasetsTable {
  access?: FormManager["access"];
  table: Table<IntegratedObjectSourceDataset>;
}
