import { ColumnDef, RowData, VisibilityState } from "@tanstack/react-table";
import { GraphValueCell } from "../../components/TableCell/components/GraphValueCell/graphValueCell";
import { Meta } from "./entities";

/**
 * Build meta for the table.
 * Comprises of three areas: organ specific, recommended, and required.
 * Each of these is a visibility state, which represents for each "toggle" view
 * which columns should be visible.
 * @param columns - Columns.
 * @returns Meta.
 */
export function buildMeta(columns: ColumnDef<RowData>[]): Meta {
  let organSpecific: VisibilityState = {};
  let recommended: VisibilityState = {};
  let required: VisibilityState = {};

  for (const column of columns) {
    if (column.enableHiding === false) continue;
    organSpecific[column.id] = Boolean(column.meta?.organSpecific);
    recommended[column.id] = !column.meta?.required;
    required[column.id] = !!column.meta?.required;
  }

  const meta = {
    organSpecific,
    recommended,
    required,
  };

  for (const [key, value] of Object.entries(meta)) {
    if (Object.values(value).some((v) => v)) continue;
    delete meta[key as keyof Meta];
  }

  return meta;
}

/**
 * Get the row id.
 * @param row - Row.
 * @returns Row id.
 */
export function getRowId(row: RowData): string {
  return row.sourceStudy;
}

/**
 * Check if the attribute is organ specific.
 * @param value - Attribute value.
 * @returns True if the attribute is organ specific, false otherwise.
 */
function isOrganSpecific(value: unknown): boolean {
  return (value as { bioNetworks: unknown[] }).bioNetworks.length < 18;
}

/**
 * Check if the attribute is required.
 * @param value - Attribute value.
 * @returns True if the attribute is required, false otherwise.
 */
function isRequired(value: unknown): boolean {
  return (value as { required: boolean }).required;
}

/**
 * Make an attribute column.
 * @param id - Column id.
 * @param value - Column value.
 * @returns Attribute column.
 */
function makeAttributeColumn(id: string, value: unknown): ColumnDef<RowData> {
  return {
    accessorKey: `attributes.${id}`,
    cell: GraphValueCell,
    header: value.title,
    id,
    meta: {
      organSpecific: isOrganSpecific(value),
      required: isRequired(value),
    },
  } as ColumnDef<RowData>;
}

/**
 * Make a source study column.
 * @returns Source study column.
 */
function makeSourceStudyColumn(): ColumnDef<RowData> {
  return {
    accessorKey: "sourceStudy",
    enableHiding: false,
    header: "Title/Criteria",
    id: "sourceStudy",
    meta: { columnPinned: true },
  };
}

/**
 * Make columns for the table.
 * @param data - Row data.
 * @returns Table column definitions.
 */
export function makeColumns(sourceStudies: unknown[]): ColumnDef<RowData>[] {
  // Start with the pinned column (source study).
  const sourceStudyColumn = makeSourceStudyColumn();
  const columns = [sourceStudyColumn];

  // Take the first source study to get the attributes.
  const sourceStudy = sourceStudies[0] as RowData;

  // Add the attribute columns.
  for (const [key, value] of Object.entries(sourceStudy.attributes)) {
    columns.push(makeAttributeColumn(key, value));
  }

  return columns;
}
