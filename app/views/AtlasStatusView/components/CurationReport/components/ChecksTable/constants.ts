import { labelColumn } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/utils";
import { type AtlasCheck } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { type ColumnDef } from "@tanstack/react-table";

export const CHECK_COLUMNS: ColumnDef<AtlasCheck>[] = [
  labelColumn("category", "Category", (check) => [check.category]),
];
