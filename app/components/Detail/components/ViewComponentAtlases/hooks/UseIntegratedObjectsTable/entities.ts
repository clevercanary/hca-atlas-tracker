import { Table } from "@tanstack/react-table";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export interface UseIntegratedObjectsTable {
  access?: FormManager["access"];
  table: Table<AtlasIntegratedObject>;
}
