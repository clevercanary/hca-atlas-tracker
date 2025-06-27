import { LinkCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/LinkCell/linkCell";
import { ColumnDef } from "@tanstack/react-table";
import { KeyValueCell } from "../../../components/Table/components/TableCell/components/KeyValueCell/keyValueCell";
import { ValidationSummaryCell } from "../components/Table/components/TableCell/components/ValidationSummaryCell/validationSummaryCell";
import { MetadataEntrySheet } from "../entities";
import {
  buildDataSummary,
  buildEntrySheetTitle,
  buildLastUpdated,
  buildPublicationString,
  buildValidationSummary,
} from "./viewBuilders";

const COLUMN_DATA_SUMMARY = {
  accessorKey: "validationSummary.dataset_count",
  cell: (props) => KeyValueCell(buildDataSummary(props)),
  enableSorting: false,
  header: "Data summary",
  id: "dataSummary",
  meta: { width: { max: "1.2fr", min: "200px" } },
} as ColumnDef<MetadataEntrySheet>;

const COLUMN_ENTRY_SHEET_TITLE = {
  accessorKey: "entrySheetTitle",
  cell: (props) => LinkCell(buildEntrySheetTitle(props)),
  header: "Sheet name",
  id: "entrySheetTitle",
  meta: { columnPinned: true, width: { max: "5.5fr", min: "240px" } },
} as ColumnDef<MetadataEntrySheet>;

const COLUMN_LAST_UPDATED = {
  accessorKey: "lastUpdated.date",
  cell: (props) => KeyValueCell(buildLastUpdated(props)),
  enableSorting: false,
  header: "Last updated",
  id: "lastUpdated",
  meta: { width: { max: "1.8fr", min: "200px" } },
} as ColumnDef<MetadataEntrySheet>;

const COLUMN_PUBLICATION_STRING = {
  accessorKey: "publicationString",
  cell: (props) => LinkCell(buildPublicationString(props)),
  header: "Source study",
  id: "publicationString",
  meta: { width: { max: "1.6fr", min: "200px" } },
} as ColumnDef<MetadataEntrySheet>;

const COLUMN_VALIDATION_SUMMARY: ColumnDef<MetadataEntrySheet> = {
  accessorKey: "validationSummary.error_count",
  cell: (props) => ValidationSummaryCell(buildValidationSummary(props)),
  enableSorting: false,
  header: "Validation",
  id: "validationSummary",
  meta: { width: { max: "1fr", min: "200px" } },
} as ColumnDef<MetadataEntrySheet>;

export const COLUMNS: ColumnDef<MetadataEntrySheet>[] = [
  COLUMN_ENTRY_SHEET_TITLE,
  COLUMN_PUBLICATION_STRING,
  COLUMN_DATA_SUMMARY,
  COLUMN_VALIDATION_SUMMARY,
  COLUMN_LAST_UPDATED,
];
