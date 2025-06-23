import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { KeyValuePairsProps } from "@databiosphere/findable-ui/lib/components/common/KeyValuePairs/keyValuePairs";
import { CHIP_PROPS } from "@databiosphere/findable-ui/src/styles/common/mui/chip";
import { ChipProps, LinkProps } from "@mui/material";
import { CellContext } from "@tanstack/react-table";
import { formatDistanceToNowStrict } from "date-fns";
import { getRouteURL } from "../../../common/utils";
import { getPartialCellContext } from "../../../components/Table/components/utils";
import { ROUTE } from "../../../routes/constants";
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
    href: `https://docs.google.com/spreadsheets/d/${entrySheetId}`,
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
): CellContext<MetadataEntrySheet, ChipProps> {
  const { row } = cellContext;
  const { validationSummary } = row.original;
  const { error_count } = validationSummary;
  return getPartialCellContext({
    color: error_count ? CHIP_PROPS.COLOR.ERROR : CHIP_PROPS.COLOR.SUCCESS,
    icon: error_count ? ErrorIcon({}) : SuccessIcon({}),
    label: error_count ? `${error_count} errors` : "Valid",
    variant: CHIP_PROPS.VARIANT.STATUS,
  });
}
