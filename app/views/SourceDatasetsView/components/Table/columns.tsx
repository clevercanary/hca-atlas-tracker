import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { NTagCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/NTagCell/nTagCell";
import { ColumnDef } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { FileDownloadCell } from "../../../../components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/fileDownloadCell";
import { PinnedNTagCell } from "../../../../components/Table/components/TableCell/components/NTagCell/components/PinnedNTagCell/pinnedNTagCell";
import {
  buildAssay,
  buildCellCount,
  buildDisease,
  buildSuspensionType,
  buildTissue,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  buildSourceDatasetDownload,
  buildSourceDatasetTitle,
} from "./viewBuilders";

const COLUMN_ASSAY = {
  accessorKey: "assay",
  cell: ({ row }) => <NTagCell {...buildAssay(row.original)} />,
  header: "Assay",
  meta: { header: "Assay", width: { max: "1fr", min: "128px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_CELL_COUNT = {
  accessorKey: "cellCount",
  cell: ({ row }) => <BasicCell {...buildCellCount(row.original)} />,
  header: "Cell Count",
  meta: { header: "Cell Count", width: { max: "0.75fr", min: "124px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_DISEASE = {
  accessorKey: "disease",
  cell: ({ row }) => <PinnedNTagCell {...buildDisease(row.original)} />,
  header: "Disease",
  meta: { header: "Disease", width: { max: "1fr", min: "128px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_DOWNLOAD = {
  accessorKey: "download",
  cell: (ctx) => <FileDownloadCell {...buildSourceDatasetDownload(ctx)} />,
  enableSorting: false,
  header: "Download",
  meta: { width: "max-content" },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_SUSPENSION_TYPE = {
  accessorKey: "suspensionType",
  cell: ({ row }) => <NTagCell {...buildSuspensionType(row.original)} />,
  header: "Suspension Type",
  meta: { header: "Suspension Type", width: { max: "1fr", min: "128px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_TISSUE = {
  accessorKey: "tissue",
  cell: ({ row }) => <NTagCell {...buildTissue(row.original)} />,
  header: "Tissue",
  meta: { header: "Tissue", width: { max: "1fr", min: "128px" } },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

const COLUMN_TITLE = {
  accessorKey: "title",
  cell: (ctx) => <BasicCell {...buildSourceDatasetTitle(ctx)} />,
  header: "Dataset Title",
  meta: {
    columnPinned: true,
    header: "Dataset Title",
    width: { max: "1.6fr", min: "240px" },
  },
} as ColumnDef<HCAAtlasTrackerSourceDataset>;

export const COLUMNS: ColumnDef<HCAAtlasTrackerSourceDataset>[] = [
  COLUMN_DEF.ROW_POSITION as ColumnDef<HCAAtlasTrackerSourceDataset>,
  COLUMN_DOWNLOAD,
  COLUMN_TITLE,
  COLUMN_ASSAY,
  COLUMN_SUSPENSION_TYPE,
  COLUMN_TISSUE,
  COLUMN_DISEASE,
  COLUMN_CELL_COUNT,
];
