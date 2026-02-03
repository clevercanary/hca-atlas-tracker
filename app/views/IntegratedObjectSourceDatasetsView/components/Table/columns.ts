import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { ColumnDef } from "@tanstack/react-table";
import { renderFileName, renderPublicationString } from "./viewBuilders";
import { IntegratedObjectSourceDataset } from "../../entities";
import {
  buildAssay,
  buildDisease,
  buildSuspensionType,
  buildTissue,
  renderNTagCell,
  renderPinnedNTagCell,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { IconButton } from "./components/IconButton/iconButton";

const COLUMN_ACTION: ColumnDef<IntegratedObjectSourceDataset> = {
  cell: IconButton,
  enableSorting: false,
  header: "",
  id: "action",
  meta: { width: "auto" },
};

const COLUMN_ASSAY: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "assay",
  cell: renderNTagCell<IntegratedObjectSourceDataset>(buildAssay),
  header: "Assay",
  meta: { width: { max: "1fr", min: "150px" } },
};

const COLUMN_CELL_COUNT: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "cellCount",
  cell: ({ row }) => row.original.cellCount.toLocaleString(),
  header: "Cell Count",
  meta: { width: { max: "1fr", min: "116px" } },
};

const COLUMN_DISEASE: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "disease",
  cell: renderPinnedNTagCell<IntegratedObjectSourceDataset>(buildDisease),
  header: "Disease",
  meta: { width: { max: "1fr", min: "150px" } },
};

const COLUMN_FILE_NAME: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "fileName",
  cell: renderFileName,
  header: "File Name",
  meta: { columnPinned: true, width: { max: "2fr", min: "220px" } },
};

const COLUMN_SUSPENSION_TYPE: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "suspensionType",
  cell: renderNTagCell<IntegratedObjectSourceDataset>(buildSuspensionType),
  header: "Suspension Type",
  meta: { width: { max: "1fr", min: "150px" } },
};

const COLUMN_TISSUE: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "tissue",
  cell: renderNTagCell<IntegratedObjectSourceDataset>(buildTissue),
  header: "Tissue",
  meta: { width: { max: "1fr", min: "150px" } },
};

const COLUMN_TITLE: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "title",
  header: "Source Dataset",
  meta: { width: { max: "2fr", min: "220px" } },
};

const COLUMN_PUBLICATION: ColumnDef<IntegratedObjectSourceDataset> = {
  accessorKey: "publicationString",
  cell: renderPublicationString,
  header: "Publication",
  meta: { width: { max: "1fr", min: "180px" } },
};

export const COLUMNS: ColumnDef<IntegratedObjectSourceDataset>[] = [
  COLUMN_DEF.ROW_POSITION as ColumnDef<IntegratedObjectSourceDataset>,
  COLUMN_PUBLICATION,
  COLUMN_FILE_NAME,
  COLUMN_TITLE,
  COLUMN_ASSAY,
  COLUMN_SUSPENSION_TYPE,
  COLUMN_TISSUE,
  COLUMN_DISEASE,
  COLUMN_CELL_COUNT,
  COLUMN_ACTION,
];
