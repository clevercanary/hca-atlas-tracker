import {
  ColumnDef as TanStackColumnDef,
  Table as TanStackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { HeatmapEntrySheet } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";

export type ColumnDef = TanStackColumnDef<HeatmapEntrySheet> & {
  meta: ColumnMeta;
};

export interface ColumnMeta {
  organSpecific: boolean;
  required: boolean;
}

export type Table = TanStackTable<HeatmapEntrySheet> & {
  options: TanStackTable<HeatmapEntrySheet>["options"] & {
    meta: TableMeta;
  };
};

export interface TableMeta {
  viewVisibilityState: ViewVisibilityState;
}

export type View = "required" | "recommended" | "organSpecific";

export type ViewVisibilityState = Map<View, VisibilityState>;
