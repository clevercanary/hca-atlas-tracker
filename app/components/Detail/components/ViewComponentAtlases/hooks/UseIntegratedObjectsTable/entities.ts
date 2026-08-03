import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { type Table } from "@tanstack/react-table";

export interface UseIntegratedObjectsTable {
  access?: FormManager["access"];
  table: Table<AtlasIntegratedObject>;
}
