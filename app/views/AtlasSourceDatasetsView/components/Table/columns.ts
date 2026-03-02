import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { getApiEntityFileVersion } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { CAPIngestStatusCell } from "../../../../components/Table/components/TableCell/components/CAPIngestStatusCell/capIngestStatusCell";
import { ROUTE } from "../../../../routes/constants";
import {
  buildAssay,
  buildDisease,
  buildGeneCount,
  buildSuspensionType,
  buildTissue,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { AtlasSourceDataset } from "../../entities";
import {
  renderCAPUrl,
  renderSourceDatasetCellCount,
  renderSourceDatasetFileDownloadCell,
  renderSourceDatasetValidationStatus,
} from "./viewBuilders";

const COLUMN_CAP_URL = {
  accessorKey: "capUrl",
  cell: renderCAPUrl,
  enableSorting: false,
  header: "CAP URL",
  id: "capUrl",
  meta: { width: { max: "0.5fr", min: "160px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_ASSAY = {
  accessorKey: "assay",
  cell: ({ row }) => C.NTagCell(buildAssay(row.original)),
  header: "Assay",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_CAP_INGEST_STATUS = {
  cell: CAPIngestStatusCell,
  enableSorting: false,
  header: "CAP Ingest Status",
  id: "capIngestStatus",
  meta: { width: { max: "0.5fr", min: "160px" } },
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
  accessorKey: "baseFileName",
  cell: ({ row }) =>
    C.Link({
      label: row.original.baseFileName,
      url: getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
        atlasId: row.original.atlasId,
        sourceDatasetId: row.original.id,
      }),
    }),
  header: "File Name",
  meta: { columnPinned: true, width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_GENE_COUNT = {
  accessorKey: "geneCount",
  cell: ({ row }) => C.BasicCell(buildGeneCount(row.original)),
  header: "Gene Count",
  meta: { width: { max: "0.5fr", min: "120px" } },
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

const COLUMN_FILE_EVENT_TIME = {
  accessorKey: "fileEventTime",
  cell: ({ row }) => row.original.fileEventTime,
  header: "Uploaded At",
  meta: { width: { max: "1fr", min: "160px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_PUBLICATION_STATUS = {
  accessorKey: "publicationStatus",
  header: "Publication Status",
  meta: { width: { max: "0.5fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

const COLUMN_SOURCE_STUDY = {
  accessorKey: "publicationString",
  cell: ({ row }) =>
    C.Link({
      label: row.original.publicationString || LABEL.UNSPECIFIED,
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

const COLUMN_VERSION = {
  accessorFn: getApiEntityFileVersion,
  cell: (ctx) => {
    const { getValue } = ctx as CellContext<AtlasSourceDataset, string>;
    return C.BasicCell({ value: getValue() });
  },
  header: "Version",
  meta: { width: { max: "1fr", min: "120px" } },
} as ColumnDef<AtlasSourceDataset>;

export const COLUMNS: ColumnDef<AtlasSourceDataset>[] = [
  COLUMN_DEF.ROW_POSITION as ColumnDef<AtlasSourceDataset>,
  COLUMN_DEF.ROW_SELECTION as ColumnDef<AtlasSourceDataset>,
  COLUMN_DOWNLOAD,
  COLUMN_FILE_NAME,
  COLUMN_VERSION,
  COLUMN_TITLE,
  COLUMN_SIZE_BYTES,
  COLUMN_FILE_EVENT_TIME,
  COLUMN_SOURCE_STUDY,
  COLUMN_PUBLICATION_STATUS,
  COLUMN_REPROCESSED_STATUS,
  COLUMN_VALIDATION_STATUS,
  COLUMN_CAP_INGEST_STATUS,
  COLUMN_CAP_URL,
  COLUMN_ASSAY,
  COLUMN_SUSPENSION_TYPE,
  COLUMN_TISSUE,
  COLUMN_DISEASE,
  COLUMN_CELL_COUNT,
  COLUMN_GENE_COUNT,
  /* Hidden columns */
  COLUMN_FILE_ID,
];
