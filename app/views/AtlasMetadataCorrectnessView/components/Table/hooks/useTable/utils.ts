import { VisibilityState } from "@tanstack/react-table";
import {
  HeatmapEntrySheet,
  HeatmapField,
} from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { EllipsisCell } from "../../../../../../../app/components/Entity/components/common/Table/components/TableCell/components/EllipsisCell/ellipsisCell";
import { GraphValueCell } from "../../components/TableCell/components/GraphValueCell/graphValueCell";
import { ColumnDef, TableMeta, View, ViewVisibilityState } from "./entities";

/**
 * Build table meta containing visibility states for each view type.
 * Creates a Map of view types (required, recommended, organSpecific) to their
 * corresponding column visibility states for toggle functionality.
 * @param columns - Columns.
 * @returns Meta.
 */
export function buildTableMeta(columns: ColumnDef[]): TableMeta {
  const viewVisibilityState: ViewVisibilityState = new Map();

  // Initialize the view state Map in order of "required", "recommended", "organSpecific".
  // We use the Map order to render the toggle button group.
  viewVisibilityState.set("required", {});
  viewVisibilityState.set("recommended", {});
  viewVisibilityState.set("organSpecific", {});

  for (const column of columns) {
    if (column.enableHiding === false) continue;
    if (!column.id) continue;

    // Grab the column meta.
    const { meta } = column;
    const { organSpecific, required } = meta;

    // Set the view state for each column.
    // We can assert that the view state exists because we initialized it above.
    viewVisibilityState.get("organSpecific")![column.id] = organSpecific;
    viewVisibilityState.get("recommended")![column.id] = !required;
    viewVisibilityState.get("required")![column.id] = required;
  }

  // Remove views with no visible columns.
  for (const [key, value] of viewVisibilityState.entries()) {
    if (Object.values(value).some((v) => !!v)) continue;
    viewVisibilityState.delete(key as View);
  }

  return { viewVisibilityState };
}

/**
 * Filter out sheets that don't have correctness data.
 * @param sheet - Sheet.
 * @returns Whether the sheet has correctness data.
 */
export function filterSheet(sheet: HeatmapEntrySheet): boolean {
  return sheet.correctness !== null;
}

/**
 * Get the row id.
 * @param row - Row.
 * @returns Row id.
 */
export function getRowId(row: HeatmapEntrySheet): string {
  return row.title;
}

/**
 * Initialize the visibility state.
 * @param meta - Meta.
 * @returns Visibility state.
 */
export function initVisibilityState(meta: TableMeta): VisibilityState {
  const { viewVisibilityState } = meta;

  // Take the first entry.
  const key = [...viewVisibilityState.keys()][0];

  if (!key) return {};

  // Return the visibility state for the first key.
  return viewVisibilityState.get(key) || {};
}

/**
 * Make an attribute column.
 * Add field values "required" and "organSpecific" to the column meta for visibility grouping.
 * @param field - Column field.
 * @returns Attribute column.
 */
function makeAttributeColumn(field: HeatmapField): ColumnDef {
  return {
    accessorKey: `correctness.correctCounts.${field.name}`,
    cell: GraphValueCell,
    header: field.title,
    id: field.name,
    meta: {
      header: field.title,
      organSpecific: field.organSpecific,
      required: field.required,
    },
  } as ColumnDef;
}

/**
 * Make columns for the table.
 * @param fields - Heatmap fields.
 * @returns Table column definitions.
 */
export function makeColumns(fields: HeatmapField[]): ColumnDef[] {
  // Start with the pinned column (title).
  const titleColumn = makeTitleColumn();
  const columns = [titleColumn];

  // Add the attribute columns.
  for (const field of fields) {
    columns.push(makeAttributeColumn(field));
  }

  return columns;
}

/**
 * Make a title column.
 *
 * @returns Title column.
 */
function makeTitleColumn(): ColumnDef {
  return {
    accessorKey: "title",
    cell: EllipsisCell,
    enableHiding: false,
    header: "Title/Criteria",
    id: "titleCriteria",
    meta: { columnPinned: true, organSpecific: false, required: false },
  } as ColumnDef;
}
