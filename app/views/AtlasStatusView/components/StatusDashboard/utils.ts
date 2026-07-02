import { AtlasStatusSummary } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ROW_LABEL, SECTION_HEADING, TITLE } from "./constants";
import {
  BADGE_VARIANT,
  MetricBadgeModel,
  MetricCardModel,
  MetricRowModel,
  MetricSectionModel,
  ROW_VARIANT,
  SECTION_STATUS,
  SectionStatus,
  ValidationDimension,
} from "./types";

/**
 * Builds the CAP funnel section. Valid = required - invalid (so the funnel
 * reconciles: required = valid + invalid), and Published is shown as a subset
 * of valid. Source datasets show an explicit Required row; integrated objects
 * do not (required = total).
 * @param required - CAP required base count (original count / total).
 * @param capInvalid - Count that failed CAP validation.
 * @param capPublished - Count published via CAP (a subset of valid).
 * @param showRequired - Whether to render an explicit Required row.
 * @returns CAP funnel section model.
 */
function buildCapSection(
  required: number,
  capInvalid: number,
  capPublished: number,
  showRequired: boolean,
): MetricSectionModel {
  const rows: MetricRowModel[] = [];
  if (showRequired) {
    rows.push({
      label: ROW_LABEL.REQUIRED,
      value: required,
      variant: ROW_VARIANT.PLAIN,
    });
  }
  rows.push(
    {
      label: ROW_LABEL.VALID,
      value: Math.max(0, required - capInvalid),
      variant: ROW_VARIANT.PLAIN,
    },
    {
      highlight: capInvalid > 0,
      label: ROW_LABEL.INVALID,
      value: capInvalid,
      variant: ROW_VARIANT.PLAIN,
    },
    {
      label: ROW_LABEL.PUBLISHED,
      value: capPublished,
      variant: ROW_VARIANT.PLAIN,
    },
  );
  return {
    heading: SECTION_HEADING.CAP,
    rows,
    status: getCapStatus(required, capInvalid),
  };
}

/**
 * Builds the metric card model for the integrated objects group.
 * @param summary - Atlas status summary.
 * @returns integrated objects metric card model.
 */
export function buildIntegratedObjectsCard(
  summary: AtlasStatusSummary,
): MetricCardModel {
  const { integratedObjects } = summary;
  // An integrated object must pass every section to be valid, so the fully valid
  // count is the smallest valid across CAP (total - capInvalid), Tier-1, and Cell
  // Annotation, clamped to 0..total (guarding against inconsistent counts). The
  // badge and progress bar share it: invalid = total - fullyValid.
  const sectionValids = [
    integratedObjects.total - integratedObjects.capInvalid,
    integratedObjects.tier1Valid,
    integratedObjects.cellAnnotationValid,
  ];
  const fullyValid = Math.max(0, Math.min(...sectionValids));
  const invalid = integratedObjects.total - fullyValid;
  return {
    badge: getMinValidBadge(
      integratedObjects.total,
      invalid,
      integratedObjects.capInvalid +
        integratedObjects.tier1Invalid +
        integratedObjects.cellAnnotationInvalid,
      "0 valid integrated objects",
    ),
    // Fill = fully-valid / total (= (total - invalid) / total), matching the
    // badge below it (so the unfilled portion is invalid / total).
    progress: getProgress(fullyValid, integratedObjects.total),
    sections: [
      // All integrated objects are required for CAP, so there is no "Required"
      // row here (required = total).
      buildCapSection(
        integratedObjects.total,
        integratedObjects.capInvalid,
        integratedObjects.capPublished,
        false,
      ),
      buildValidationSection(
        SECTION_HEADING.METADATA_TIER1,
        integratedObjects.tier1Valid,
        integratedObjects.tier1Invalid,
      ),
      buildValidationSection(
        SECTION_HEADING.CELL_ANNOTATION,
        integratedObjects.cellAnnotationValid,
        integratedObjects.cellAnnotationInvalid,
      ),
    ],
    title: TITLE.INTEGRATED_OBJECTS,
    total: integratedObjects.total,
  };
}

/**
 * Builds the metric card model for the source datasets group.
 * @param summary - Atlas status summary.
 * @returns source datasets metric card model.
 */
export function buildSourceDatasetsCard(
  summary: AtlasStatusSummary,
): MetricCardModel {
  const { sourceDatasets } = summary;
  const unspecified = Math.max(
    0,
    sourceDatasets.total - sourceDatasets.original - sourceDatasets.reprocessed,
  );
  // Source datasets validate Tier-1 only, so invalid is the Tier-1 invalid count
  // — shared by the badge and the progress bar.
  const invalid = sourceDatasets.tier1Invalid;
  return {
    badge: getColumnBadge(
      [{ invalid, valid: sourceDatasets.tier1Valid }],
      "0 valid source datasets",
    ),
    // Fill = (total - invalid) / total to match the "N invalid" badge below it
    // (pending datasets count towards the bar). But when nothing has been
    // validated yet (no valid and no invalid), show an empty bar rather than a
    // full one.
    progress:
      sourceDatasets.tier1Valid + invalid === 0
        ? 0
        : getProgress(sourceDatasets.total - invalid, sourceDatasets.total),
    sections: [
      {
        heading: SECTION_HEADING.PROCESSING,
        rows: [
          {
            label: ROW_LABEL.ORIGINAL,
            value: sourceDatasets.original,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.REPROCESSED,
            value: sourceDatasets.reprocessed,
            variant: ROW_VARIANT.PLAIN,
          },
          // "Unspecified" is the remainder of the total not classified as
          // original or reprocessed, so the breakdown reconciles with the total.
          // A non-zero remainder is surfaced by the heading rollup, not a row icon.
          {
            label: ROW_LABEL.UNSPECIFIED,
            value: unspecified,
            variant: ROW_VARIANT.PLAIN,
          },
        ],
        // Amber while any datasets are unclassified or none exist yet, else green.
        status: getWarningStatus(sourceDatasets.total, unspecified),
      },
      // CAP funnel: only a subset of source datasets require CAP, so an explicit
      // "Required" row is shown (the API has no dedicated capRequired field, so
      // the original count stands in).
      buildCapSection(
        sourceDatasets.original,
        sourceDatasets.capInvalid,
        sourceDatasets.capPublished,
        true,
      ),
      buildValidationSection(
        SECTION_HEADING.METADATA_TIER1,
        sourceDatasets.tier1Valid,
        sourceDatasets.tier1Invalid,
      ),
    ],
    title: TITLE.SOURCE_DATASETS,
    total: sourceDatasets.total,
  };
}

/**
 * Builds the metric card model for the source studies group.
 * @param summary - Atlas status summary.
 * @returns source studies metric card model.
 */
export function buildSourceStudiesCard(
  summary: AtlasStatusSummary,
): MetricCardModel {
  const { sourceStudies } = summary;
  return {
    badge: getPublicationBadge(
      sourceStudies.published,
      sourceStudies.unpublished,
    ),
    // Fill = (total - invalid) / total so the bar matches the "N unpublished"
    // badge below it, consistent with the other cards.
    progress: getProgress(
      sourceStudies.total - sourceStudies.unpublished,
      sourceStudies.total,
    ),
    sections: [
      {
        heading: SECTION_HEADING.PUBLICATION_STATUS,
        rows: [
          {
            label: ROW_LABEL.PUBLISHED,
            value: sourceStudies.published,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.UNPUBLISHED,
            value: sourceStudies.unpublished,
            variant: ROW_VARIANT.PLAIN,
          },
        ],
        // Amber while any studies are unpublished or none exist yet, else green.
        status: getWarningStatus(
          sourceStudies.total,
          sourceStudies.unpublished,
        ),
      },
    ],
    title: TITLE.SOURCE_STUDIES,
    total: sourceStudies.total,
  };
}

/**
 * Builds a validation block section. The heading carries a single rollup status
 * icon (driven by the counts), and the Valid/Invalid counts sit beneath it as
 * plain rows — no per-row icon or colour, so the heading is the only indicator.
 * @param heading - Section heading.
 * @param valid - Valid count.
 * @param invalid - Invalid count.
 * @returns validation block section model.
 */
function buildValidationSection(
  heading: string,
  valid: number,
  invalid: number,
): MetricSectionModel {
  return {
    heading,
    rows: [
      { label: ROW_LABEL.VALID, value: valid, variant: ROW_VARIANT.PLAIN },
      {
        highlight: invalid > 0,
        label: ROW_LABEL.INVALID,
        value: invalid,
        variant: ROW_VARIANT.PLAIN,
      },
    ],
    status: getValidationStatus(valid, invalid),
  };
}

/**
 * Returns the CAP section rollup status: ERROR (red) when any failed CAP
 * validation, PASS (green) when items are required and none failed, and WARNING
 * (amber) when nothing is required yet (empty — work to do).
 * @param required - CAP required count.
 * @param invalid - CAP invalid count.
 * @returns CAP section rollup status.
 */
export function getCapStatus(required: number, invalid: number): SectionStatus {
  if (invalid > 0) return SECTION_STATUS.ERROR;
  if (required > 0) return SECTION_STATUS.PASS;
  return SECTION_STATUS.WARNING;
}

/**
 * Returns the rollup badge model for a column, computed from the worst state
 * across all of its validation dimensions: a red chip with the combined invalid
 * count when any are invalid, a green chip with the largest dimension's valid
 * count when some are valid, and a neutral chip with the given empty label when
 * nothing has been validated yet.
 * @param dimensions - Per-dimension valid/invalid counts.
 * @param emptyLabel - Label for the neutral (nothing validated) chip.
 * @returns column badge model.
 */
function getColumnBadge(
  dimensions: ValidationDimension[],
  emptyLabel: string,
): MetricBadgeModel {
  // Sum invalids across dimensions — each invalid is a distinct failure to act
  // on, so the total reads as the column's outstanding work.
  const totalInvalid = dimensions.reduce((sum, d) => sum + d.invalid, 0);
  if (totalInvalid > 0) {
    return { label: `${totalInvalid} invalid`, variant: BADGE_VARIANT.ERROR };
  }
  // For the positive case use the largest dimension's valid count rather than a
  // sum — dimensions validate the same entities, so summing would inflate past
  // the column total.
  const maxValid = dimensions.reduce((max, d) => Math.max(max, d.valid), 0);
  if (maxValid > 0) {
    return { label: `${maxValid} valid`, variant: BADGE_VARIANT.SUCCESS };
  }
  return { label: emptyLabel, variant: BADGE_VARIANT.DEFAULT };
}

/**
 * Returns the column badge for a column whose sections all validate the full
 * population (e.g. integrated objects). `invalid` is the not-fully-valid count
 * (total minus the smallest per-section valid — an item must pass every section
 * to be valid). The chip is: neutral when the column is empty, green when every
 * item is fully valid, red ("N invalid") when there are known failures, and
 * amber ("N pending") when the shortfall is only sections not yet validated.
 * @param total - Total item count.
 * @param invalid - Not-fully-valid count (total - smallest per-section valid).
 * @param invalidTotal - Combined known-invalid count across sections.
 * @param emptyLabel - Label for the neutral (empty column) chip.
 * @returns column badge model.
 */
export function getMinValidBadge(
  total: number,
  invalid: number,
  invalidTotal: number,
  emptyLabel: string,
): MetricBadgeModel {
  if (total === 0) {
    return { label: emptyLabel, variant: BADGE_VARIANT.DEFAULT };
  }
  if (invalid === 0) {
    return { label: `${total} valid`, variant: BADGE_VARIANT.SUCCESS };
  }
  if (invalidTotal > 0) {
    return { label: `${invalid} invalid`, variant: BADGE_VARIANT.ERROR };
  }
  return { label: `${invalid} pending`, variant: BADGE_VARIANT.CAUTION };
}

/**
 * Returns the progress percentage clamped to 0-100 for a numerator over a total.
 * Clamping guards against inconsistent summary counts (e.g. an invalid count
 * exceeding the total) producing an out-of-range value for the progress bar.
 * @param numerator - Subset count.
 * @param total - Total count.
 * @returns percentage between 0 and 100.
 */
function getProgress(numerator: number, total: number): number {
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, (numerator / total) * 100));
}

/**
 * Returns the publication badge model: an amber chip while studies remain
 * unpublished, a green chip when all studies are published, and a neutral chip when
 * there are no source studies at all.
 * @param published - Published source study count.
 * @param unpublished - Unpublished source study count.
 * @returns publication badge model.
 */
function getPublicationBadge(
  published: number,
  unpublished: number,
): MetricBadgeModel {
  if (unpublished > 0) {
    return {
      label: `${unpublished} unpublished`,
      variant: BADGE_VARIANT.CAUTION,
    };
  }
  if (published > 0) {
    return { label: `${published} published`, variant: BADGE_VARIANT.SUCCESS };
  }
  return { label: "0 source studies", variant: BADGE_VARIANT.DEFAULT };
}

/**
 * Returns the rollup status for a validation block from its counts: ERROR when
 * any are invalid (failures dominate), PASS when some are valid and none invalid,
 * and PENDING when nothing has been validated yet (a call to action, not a pass).
 * @param valid - Valid count.
 * @param invalid - Invalid count.
 * @returns validation block rollup status.
 */
export function getValidationStatus(
  valid: number,
  invalid: number,
): SectionStatus {
  if (invalid > 0) return SECTION_STATUS.ERROR;
  if (valid > 0) return SECTION_STATUS.PASS;
  return SECTION_STATUS.PENDING;
}

/**
 * Returns a breakdown section's rollup status: WARNING (amber) while items
 * remain outstanding (e.g. unspecified datasets, unpublished studies) OR while
 * the section is empty (nothing exists yet — work to do), otherwise PASS
 * (green) once items exist and none are outstanding.
 * @param total - Total count of items in the section.
 * @param outstanding - Count of outstanding items.
 * @returns breakdown section rollup status.
 */
export function getWarningStatus(
  total: number,
  outstanding: number,
): SectionStatus {
  if (outstanding > 0) return SECTION_STATUS.WARNING;
  if (total > 0) return SECTION_STATUS.PASS;
  return SECTION_STATUS.WARNING;
}
