import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { type Row, type Table } from "@tanstack/react-table";

export interface Props {
  rows: Row<AtlasIntegratedObject>[];
  table: Table<AtlasIntegratedObject>;
}
