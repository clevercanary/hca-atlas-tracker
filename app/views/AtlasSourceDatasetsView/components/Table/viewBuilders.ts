import { CellContext } from "@tanstack/react-table";
import { INTEGRITY_STATUS } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";
import { AtlasSourceDataset } from "../../entities";

/**
 * Returns the source dataset cell count.
 * If the validation status is PENDING, returns an empty string.
 * Otherwise, returns the cell count, formatted as a number.
 * @param ctx - Cell context.
 * @returns Cell count.
 */
export function renderSourceDatasetCellCount(
  ctx: CellContext<AtlasSourceDataset, number>
): string {
  const { getValue, row } = ctx;
  if (row.getValue("validationStatus") === INTEGRITY_STATUS.PENDING) return "";
  return getValue().toLocaleString();
}

/**
 * Returns the source dataset file download cell.
 * @param ctx - Cell context.
 * @returns File download cell.
 */
export function renderSourceDatasetFileDownloadCell(
  ctx: CellContext<AtlasSourceDataset, number>
): JSX.Element {
  const {
    row,
    table: { options },
  } = ctx;
  const { meta } = options;
  const { canEdit = false } = meta as { canEdit: boolean };

  // Grab the fileId and sizeBytes from the row.
  const fileId = row.original.fileId;
  const sizeBytes = row.original.sizeBytes;

  return C.FileDownloadCell({ disabled: !canEdit, fileId, sizeBytes });
}
