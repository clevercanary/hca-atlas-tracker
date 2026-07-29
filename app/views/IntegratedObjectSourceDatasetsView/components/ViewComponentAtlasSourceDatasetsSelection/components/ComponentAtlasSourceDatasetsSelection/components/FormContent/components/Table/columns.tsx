import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { NTagCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/NTagCell/nTagCell";
import { ColumnDef } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { GroupedRowSelectionCell } from "../../../../../../../../../../components/Table/components/TableCell/components/GroupedRowSelectionCell/groupedRowSelectionCell";
import { PinnedNTagCell } from "../../../../../../../../../../components/Table/components/TableCell/components/NTagCell/components/PinnedNTagCell/pinnedNTagCell";
import { RowSelectionCell } from "../../../../../../../../../../components/Table/components/TableCell/components/RowSelectionCell/rowSelectionCell";
import {
  buildAssay,
  buildCellCount,
  buildDisease,
  buildSuspensionType,
  buildTissue,
} from "../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  buildFileNameSelection,
  buildPublicationStringSelection,
  buildSelectionTitle,
} from "./viewBuilders";

const COLUMN_ASSAY = {
  accessorKey: "assay",
  cell: ({ row }) => <NTagCell {...buildAssay(row.original)} />,
  header: "Assay",
  meta: { header: "Assay", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_CELL_COUNT = {
  accessorKey: "cellCount",
  cell: ({ row }) => <BasicCell {...buildCellCount(row.original)} />,
  header: "Cell Count",
  meta: { header: "Cell Count", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_DISEASE = {
  accessorKey: "disease",
  cell: ({ row }) => <PinnedNTagCell {...buildDisease(row.original)} />,
  header: "Disease",
  meta: { header: "Disease", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_FILE_NAME = {
  accessorKey: "baseFileName",
  cell: (ctx) => <RowSelectionCell {...buildFileNameSelection(ctx)} />,
  header: "File Name",
  meta: {
    columnPinned: true,
    header: "File Name",
    width: { max: "0.5fr", min: "200px" },
  },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_PUBLICATION_STRING = {
  accessorKey: "publicationString",
  cell: (ctx) => (
    <GroupedRowSelectionCell {...buildPublicationStringSelection(ctx)} />
  ),
  meta: { columnPinned: true, width: { max: "1fr", min: "260px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_SUSPENSION_TYPE = {
  accessorKey: "suspensionType",
  cell: ({ row }) => <NTagCell {...buildSuspensionType(row.original)} />,
  header: "Suspension Type",
  meta: { header: "Suspension Type", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_TISSUE = {
  accessorKey: "tissue",
  cell: ({ row }) => <NTagCell {...buildTissue(row.original)} />,
  header: "Tissue",
  meta: { header: "Tissue", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_TITLE = {
  accessorKey: "title",
  cell: (ctx) => <BasicCell {...buildSelectionTitle(ctx)} />,
  header: "Dataset Title",
  meta: { header: "Dataset Title", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

export const COLUMNS: ColumnDef<HCAAtlasTrackerSourceDataset>[] = [
  COLUMN_DEF.ROW_POSITION as ColumnDef<HCAAtlasTrackerSourceDataset>,
  COLUMN_PUBLICATION_STRING,
  COLUMN_FILE_NAME,
  COLUMN_TITLE,
  COLUMN_ASSAY,
  COLUMN_SUSPENSION_TYPE,
  COLUMN_TISSUE,
  COLUMN_DISEASE,
  COLUMN_CELL_COUNT,
];
