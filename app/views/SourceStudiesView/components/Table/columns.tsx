import { type HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { LinksCell } from "@/app/components/Index/components/LinksCell/linksCell";
import { IconStatusBadge } from "@/app/components/Table/components/TableCell/components/IconStatusBadge/iconStatusBadge";
import {
  buildSourceStudyHcaDataRepositoryStatus,
  buildSourceStudyPublication,
} from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import { LinkCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/LinkCell/linkCell";
import { type ColumnDef } from "@tanstack/react-table";
import {
  buildMetadataSpreadsheets,
  buildSourceStudyDatasetCount,
  buildSourceStudyTitle,
} from "./viewBuilders";

const COLUMN_HCA_DATA_REPOSITORY_STATUS = {
  cell: (ctx) => (
    <IconStatusBadge
      {...buildSourceStudyHcaDataRepositoryStatus(ctx.row.original)}
    />
  ),
  enableSorting: false,
  header: "HCA Data Repository",
  meta: {
    header: "HCA Data Repository",
    width: { max: "0.75fr", min: "180px" },
  },
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

const COLUMN_METADATA_SPREADSHEETS = {
  accessorKey: "metadataSpreadsheets",
  cell: (ctx) => <LinksCell {...buildMetadataSpreadsheets(ctx)} />,
  enableSorting: false,
  header: "Metadata Entry Sheet",
  meta: { header: "Metadata Entry Sheet", width: { max: "1fr", min: "200px" } },
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

const COLUMN_PUBLICATION = {
  accessorKey: "publication",
  cell: (ctx) => <Link {...buildSourceStudyPublication(ctx.row.original)} />,
  enableSorting: false,
  header: "Publication",
  meta: { header: "Publication", width: { max: "0.4fr", min: "120px" } },
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

const COLUMN_SOURCE_DATASET_COUNT = {
  accessorKey: "sourceDatasetCount",
  cell: (ctx) => <LinkCell {...buildSourceStudyDatasetCount(ctx)} />,
  header: "Datasets",
  id: "sourceDatasetCount",
  meta: { header: "Datasets", width: { max: "0.75fr", min: "180px" } },
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

const COLUMN_SOURCE_STUDY = {
  accessorFn: (row) => getSourceStudyCitation(row),
  cell: (ctx) => <Link {...buildSourceStudyTitle(ctx)} />,
  enableSorting: true,
  header: "Source Study",
  id: "sourceStudy",
  meta: {
    columnPinned: true,
    header: "Source Study",
    width: { max: "1.2fr", min: "280px" },
  },
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

const COLUMN_TITLE = {
  accessorKey: "title",
  enableSorting: true,
  id: "title",
} as ColumnDef<HCAAtlasTrackerSourceStudy>;

export const COLUMNS: ColumnDef<HCAAtlasTrackerSourceStudy>[] = [
  COLUMN_DEF.ROW_POSITION as ColumnDef<HCAAtlasTrackerSourceStudy>,
  COLUMN_SOURCE_STUDY,
  COLUMN_PUBLICATION,
  COLUMN_METADATA_SPREADSHEETS,
  COLUMN_SOURCE_DATASET_COUNT,
  COLUMN_HCA_DATA_REPOSITORY_STATUS,
  /* Hidden columns */
  COLUMN_TITLE,
];
