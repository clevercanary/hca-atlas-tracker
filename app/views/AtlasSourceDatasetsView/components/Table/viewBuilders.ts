import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CellContext } from "@tanstack/react-table";
import {
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ValidationSummaryCell } from "../../../../components/Table/components/TableCell/components/ValidationSummaryCell/validationSummaryCell";
import { buildValidationStatus } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
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
 * Returns the source dataset validation status.
 * If the validation status is COMPLETED, returns the validation summary.
 * Otherwise, returns the validation status.
 * @param ctx - Cell context.
 * @returns Validation status.
 */
export function renderValidationStatus(
  ctx: CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]>
): JSX.Element | null {
  const { getValue, row } = ctx;
  if (getValue() === FILE_VALIDATION_STATUS.COMPLETED) {
    const validationSummary = row.original.validationSummary;
    return ValidationSummaryCell({ validationSummary });
  }
  return ChipCell(buildValidationStatus(getValue()));
}
