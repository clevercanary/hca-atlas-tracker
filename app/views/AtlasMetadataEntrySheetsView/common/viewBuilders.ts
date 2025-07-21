import { KeyValuePairsProps } from "@databiosphere/findable-ui/lib/components/common/KeyValuePairs/keyValuePairs";
import { LinkProps } from "@mui/material";
import { CellContext } from "@tanstack/react-table";
import { formatDistanceToNowStrict } from "date-fns";
import { getRouteURL } from "../../../common/utils";
import { getPartialCellContext } from "../../../components/Table/components/utils";
import { ROUTE } from "../../../routes/constants";
import { buildSheetsUrl } from "../../../utils/google-sheets";
import { ValidationSummaryCellProps } from "../components/Table/components/TableCell/components/ValidationSummaryCell/types";
import { MetadataEntrySheet } from "../entities";

/**
 * Returns data summary cell context.
 * @param cellContext - Cell context.
 * @returns Model to be used as cellContext for the KeyValuePairs component.
 */
export function buildDataSummary(
  cellContext: CellContext<MetadataEntrySheet, unknown>
): CellContext<MetadataEntrySheet, KeyValuePairsProps> {
  const { validationSummary } = cellContext.row.original;
  const { dataset_count, donor_count, sample_count } = validationSummary;
  return getPartialCellContext({
    keyValuePairs: new Map([
      ["Datasets:", dataset_count],
      ["Donors:", donor_count],
      ["Samples:", sample_count],
    ]),
  });
}

/**
 * Returns entry sheet title cell context.
 * @param cellContext - Cell context.
 * @returns Model to be used as cellContext for the LinkCell component.
 */
export function buildEntrySheetTitle(
  cellContext: CellContext<MetadataEntrySheet, unknown>
): CellContext<MetadataEntrySheet, LinkProps> {
  const { row } = cellContext;
  const { entrySheetId, entrySheetTitle } = row.original;
  return getPartialCellContext({
    children: entrySheetTitle,
    href: buildSheetsUrl(entrySheetId),
  });
}

/**
 * Returns last updated cell context.
 * @param cellContext - Cell context.
 * @returns Model to be used as cellContext for the KeyValuePairs component.
 */
export function buildLastUpdated(
  cellContext: CellContext<MetadataEntrySheet, unknown>
): CellContext<MetadataEntrySheet, KeyValuePairsProps> {
  const { row } = cellContext;
  const { lastSynced, lastUpdated } = row.original;
  const { by = "-", date } = lastUpdated || {};
  const updated = date ? `${formatDistanceToNowStrict(date)} ago` : "-";
  const refreshed = lastSynced
    ? `${formatDistanceToNowStrict(lastSynced)} ago`
    : "-";
  return getPartialCellContext({
    keyValuePairs: new Map([
      ["Updated:", updated],
      ["By:", by],
      ["Refreshed:", refreshed],
    ]),
  });
}

/**
 * Returns publication string cell context.
 * @param cellContext - Cell context.
 * @returns Model to be used as cellContext for the LinkCell component.
 */
export function buildPublicationString(
  cellContext: CellContext<MetadataEntrySheet, unknown>
): CellContext<MetadataEntrySheet, LinkProps> {
  const { row } = cellContext;
  const { atlasId, publicationString, sourceStudyId } = row.original;
  return getPartialCellContext({
    children: publicationString,
    href: getRouteURL(ROUTE.SOURCE_STUDY, { atlasId, sourceStudyId }),
  });
}

/**
 * Returns validation summary cell context.
 * @param cellContext - Cell context.
 * @returns Model to be used as cellContext for the ChipCell component.
 */
export function buildValidationSummary(
  cellContext: CellContext<MetadataEntrySheet, unknown>
): CellContext<MetadataEntrySheet, ValidationSummaryCellProps> {
  const { row } = cellContext;
  const {
    atlasId,
    id: entrySheetValidationId,
    validationSummary,
  } = row.original;
  const { error_count: errorCount } = validationSummary;
  return getPartialCellContext({
    atlasId,
    entrySheetValidationId,
    errorCount,
  });
}
