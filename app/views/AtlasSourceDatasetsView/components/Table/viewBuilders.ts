import { CellContext } from "@tanstack/react-table";
import { INTEGRITY_STATUS } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { ROUTE } from "../../../../routes/constants";
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

  // Grab the fileId, fileName and sizeBytes from the row.
  const { fileId, fileName, sizeBytes } = row.original;

  return C.FileDownloadCell({
    disabled: !canEdit,
    fileId,
    fileName,
    sizeBytes,
  });
}

/**
 * Returns the source dataset validation status cell.
 * @param ctx - Cell context.
 * @returns Validation status cell.
 */
export function renderSourceDatasetValidationStatus(
  ctx: CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]>
): JSX.Element | null {
  const { atlasId, id: sourceDatasetId } = ctx.row.original;
  const validationRoute = getRouteURL(ROUTE.ATLAS_SOURCE_DATASET_VALIDATION, {
    atlasId,
    sourceDatasetId,
    validatorName: "cap",
  });
  return C.ValidationStatusCell({ ...ctx, validationRoute });
}
