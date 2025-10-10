import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { ColumnDef } from "@tanstack/react-table";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { ROUTE } from "../../../../routes/constants";
import {
  buildAssay,
  buildDisease,
  buildSuspensionType,
  buildTissue,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { AtlasSourceDataset } from "../../entities";
import {
  renderSourceDatasetCellCount,
  renderSourceDatasetFileDownloadCell,
  renderSourceDatasetValidationStatus,
} from "./viewBuilders";

const COLUMN_ASSAY = {
  accessorKey: "assay",
  cell: ({ row }) => C.NTagCell(buildAssay(row.original)),
  header: "Assay",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_CELL_COUNT = {
  accessorKey: "cellCount",
  cell: renderSourceDatasetCellCount,
  header: "Cell Count",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_DISEASE = {
  accessorKey: "disease",
  cell: ({ row }) => C.PinnedNTagCell(buildDisease(row.original)),
  header: "Disease",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_DOWNLOAD = {
  accessorKey: "download",
  cell: renderSourceDatasetFileDownloadCell,
  enableSorting: false,
  header: "Download",
  meta: { width: "max-content" },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_FILE_ID = {
  accessorKey: "fileId",
  enableHiding: false,
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_FILE_NAME = {
  accessorKey: "fileName",
  cell: ({ row }) =>
    C.Link({
      label: row.original.fileName,
      url: getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
        atlasId: row.original.atlasId,
        sourceDatasetId: row.original.id,
      }),
    }),
  header: "File Name",
  meta: { columnPinned: true, width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_REPROCESSED_STATUS = {
  accessorKey: "reprocessedStatus",
  header: "Reprocessed Status",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_SIZE_BYTES = {
  accessorKey: "sizeBytes",
  cell: (ctx) => formatFileSize(ctx.getValue() as number),
  header: "File Size",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_SOURCE_STUDY = {
  accessorKey: "sourceStudyTitle",
  cell: ({ row }) =>
    C.Link({
      label: row.original.publicationString,
      url: row.original.sourceStudyId
        ? getRouteURL(ROUTE.SOURCE_STUDY, {
            atlasId: row.original.atlasId,
            sourceStudyId: row.original.sourceStudyId,
          })
        : "",
    }),
  header: "Source Study",
  meta: { width: { max: "1fr", min: "180px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_SUSPENSION_TYPE = {
  accessorKey: "suspensionType",
  cell: ({ row }) => C.NTagCell(buildSuspensionType(row.original)),
  header: "Suspension Type",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_TISSUE = {
  accessorKey: "tissue",
  cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
  header: "Tissue",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_TITLE = {
  accessorKey: "title",
  cell: ({ row }) => C.BasicCell({ value: row.original.title }),
  header: "Title",
  meta: { width: { max: "1fr", min: "180px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_VALIDATION_STATUS = {
  accessorKey: "validationStatus",
  cell: renderSourceDatasetValidationStatus,
  header: "Validation Summary",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

export const COLUMNS: ColumnDef<AtlasSourceDataset>[] = [
  COLUMN_DEF.ROW_SELECTION as ColumnDef<AtlasSourceDataset>,
  COLUMN_DOWNLOAD,
  COLUMN_FILE_NAME,
  COLUMN_TITLE,
  COLUMN_SIZE_BYTES,
  COLUMN_SOURCE_STUDY,
  COLUMN_REPROCESSED_STATUS,
  COLUMN_VALIDATION_STATUS,
  COLUMN_ASSAY,
  COLUMN_SUSPENSION_TYPE,
  COLUMN_TISSUE,
  COLUMN_DISEASE,
  COLUMN_CELL_COUNT,
  /* Hidden columns */
  COLUMN_FILE_ID,
];
