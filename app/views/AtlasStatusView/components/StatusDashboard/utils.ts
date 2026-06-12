import { AtlasStatusSummary } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FLAG_LABEL, ROW_LABEL, SECTION_HEADING, TITLE } from "./constants";
import {
  BADGE_VARIANT,
  MetricBadgeModel,
  MetricCardModel,
  ROW_VARIANT,
  StatusFlagModel,
} from "./types";

/**
 * Builds the metric card model for the integrated objects group.
 * @param summary - Atlas status summary.
 * @returns integrated objects metric card model.
 */
export function buildIntegratedObjectsCard(
  summary: AtlasStatusSummary,
): MetricCardModel {
  const { integratedObjects } = summary;
  return {
    badge: getTier1Badge(
      integratedObjects.tier1Valid,
      integratedObjects.tier1Invalid,
      "0 valid integrated objects",
    ),
    progress: getProgress(
      integratedObjects.tier1Valid,
      integratedObjects.total,
    ),
    sections: [
      {
        heading: SECTION_HEADING.CAP,
        rows: [
          {
            label: ROW_LABEL.VALID,
            value: integratedObjects.capReady,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.INVALID,
            value: integratedObjects.capInvalid,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.PUBLISHED,
            value: integratedObjects.capPublished,
            variant: ROW_VARIANT.PLAIN,
          },
        ],
      },
      {
        heading: SECTION_HEADING.METADATA_TIER1,
        rows: [
          {
            label: ROW_LABEL.VALID,
            value: integratedObjects.tier1Valid,
            variant: ROW_VARIANT.VALID,
          },
          {
            label: ROW_LABEL.INVALID,
            value: integratedObjects.tier1Invalid,
            variant: ROW_VARIANT.INVALID,
          },
        ],
      },
      {
        heading: SECTION_HEADING.CELL_ANNOTATION,
        rows: [
          {
            label: ROW_LABEL.VALID,
            value: integratedObjects.cellAnnotationValid,
            variant: ROW_VARIANT.VALID,
          },
          {
            label: ROW_LABEL.INVALID,
            value: integratedObjects.cellAnnotationInvalid,
            variant: ROW_VARIANT.INVALID,
          },
        ],
      },
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
  return {
    badge: getTier1Badge(
      sourceDatasets.tier1Valid,
      sourceDatasets.tier1Invalid,
      "0 valid source datasets",
    ),
    progress: getProgress(sourceDatasets.tier1Valid, sourceDatasets.total),
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
          // A non-zero remainder is flagged with a warning icon and colour.
          {
            label: ROW_LABEL.UNSPECIFIED,
            value: unspecified,
            variant: unspecified > 0 ? ROW_VARIANT.WARNING : ROW_VARIANT.PLAIN,
          },
        ],
      },
      {
        heading: SECTION_HEADING.CAP,
        rows: [
          // CAP "Required" is displayed using the original source dataset count
          // (the API does not provide a dedicated capRequired field).
          {
            label: ROW_LABEL.REQUIRED,
            value: sourceDatasets.original,
            variant: ROW_VARIANT.PLAIN,
          },
          // CAP "Valid" maps to capReady.
          {
            label: ROW_LABEL.VALID,
            value: sourceDatasets.capReady,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.INVALID,
            value: sourceDatasets.capInvalid,
            variant: ROW_VARIANT.PLAIN,
          },
          {
            label: ROW_LABEL.PUBLISHED,
            value: sourceDatasets.capPublished,
            variant: ROW_VARIANT.PLAIN,
          },
        ],
      },
      {
        heading: SECTION_HEADING.METADATA_TIER1,
        rows: [
          {
            label: ROW_LABEL.VALID,
            value: sourceDatasets.tier1Valid,
            variant: ROW_VARIANT.VALID,
          },
          {
            label: ROW_LABEL.INVALID,
            value: sourceDatasets.tier1Invalid,
            variant: ROW_VARIANT.INVALID,
          },
        ],
      },
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
    // Progress reflects the published proportion of the total.
    progress: getProgress(sourceStudies.published, sourceStudies.total),
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
      },
    ],
    title: TITLE.SOURCE_STUDIES,
    total: sourceStudies.total,
  };
}

/**
 * Builds the status flag models (boolean indicators).
 * @param summary - Atlas status summary.
 * @returns status flag models.
 */
export function buildStatusFlags(
  summary: AtlasStatusSummary,
): StatusFlagModel[] {
  return [
    { label: FLAG_LABEL.OC_ENDORSED, value: summary.ocEndorsed },
    { label: FLAG_LABEL.PUBLISHED_ON_PORTAL, value: summary.publishedOnPortal },
  ];
}

/**
 * Returns the completion percentage (0-100) for a numerator over a total.
 * @param numerator - Subset count.
 * @param total - Total count.
 * @returns percentage between 0 and 100.
 */
function getProgress(numerator: number, total: number): number {
  if (total === 0) return 0;
  return (numerator / total) * 100;
}

/**
 * Returns the publication badge model: an amber chip while studies remain
 * unpublished, a green chip once some are published, and a neutral chip when
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
 * Returns the HCA Tier-1 badge model: a red invalid chip when any are invalid,
 * a green "tier 1 valid" chip when some are valid, and a neutral chip with the
 * given empty label when nothing has been validated yet (0 valid / 0 invalid).
 * @param tier1Valid - HCA Tier-1 valid count.
 * @param tier1Invalid - HCA Tier-1 invalid count.
 * @param emptyLabel - Label for the neutral (nothing validated) chip.
 * @returns tier-1 badge model.
 */
function getTier1Badge(
  tier1Valid: number,
  tier1Invalid: number,
  emptyLabel: string,
): MetricBadgeModel {
  if (tier1Invalid > 0) {
    return {
      label: `${tier1Invalid} Tier-1 invalid`,
      variant: BADGE_VARIANT.ERROR,
    };
  }
  if (tier1Valid > 0) {
    return {
      label: `${tier1Valid} Tier-1 valid`,
      variant: BADGE_VARIANT.SUCCESS,
    };
  }
  return { label: emptyLabel, variant: BADGE_VARIANT.DEFAULT };
}
