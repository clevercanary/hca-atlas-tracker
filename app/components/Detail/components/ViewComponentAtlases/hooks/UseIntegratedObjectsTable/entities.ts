import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { Table } from "@tanstack/react-table";

export interface UseIntegratedObjectsTable {
  access?: FormManager["access"];
  table: Table<AtlasIntegratedObject>;
}
