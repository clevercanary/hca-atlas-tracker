import { UNPUBLISHED } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type GroupedRowSelectionCellProps } from "@/app/components/Table/components/TableCell/components/GroupedRowSelectionCell/groupedRowSelectionCell";
import { type RowSelectionCellProps } from "@/app/components/Table/components/TableCell/components/RowSelectionCell/rowSelectionCell";
import { type BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { type CellContext } from "@tanstack/react-table";
import { type ComponentProps } from "react";

/**
 * Returns props for the "File Name" row-selection column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @returns Props for the RowSelectionCell component.
 */
export function buildFileNameSelection({
  row,
}: CellContext<
  HCAAtlasTrackerSourceDataset,
  unknown
>): RowSelectionCellProps<HCAAtlasTrackerSourceDataset> {
  return { label: row.original.baseFileName, row };
}

/**
 * Returns props for the grouped publication row-selection column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @param ctx.table - Table instance.
 * @returns Props for the GroupedRowSelectionCell component.
 */
export function buildPublicationStringSelection({
  row,
  table,
}: CellContext<
  HCAAtlasTrackerSourceDataset,
  unknown
>): GroupedRowSelectionCellProps<HCAAtlasTrackerSourceDataset> {
  return {
    label: row.original.publicationString || UNPUBLISHED,
    row,
    table,
  };
}

/**
 * Returns props for the "Dataset Title" column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @returns Props for the BasicCell component.
 */
export function buildSelectionTitle({
  row,
}: CellContext<HCAAtlasTrackerSourceDataset, unknown>): ComponentProps<
  typeof BasicCell
> {
  return { value: row.original.title };
}
