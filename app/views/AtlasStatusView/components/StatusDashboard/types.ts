import { AtlasStatusSummary } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";

export const BADGE_VARIANT = {
  CAUTION: "CAUTION",
  DEFAULT: "DEFAULT",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;

export type BadgeVariant = (typeof BADGE_VARIANT)[keyof typeof BADGE_VARIANT];

export interface MetricBadgeModel {
  label: string;
  variant: BadgeVariant;
}

export interface MetricCardModel {
  badge?: MetricBadgeModel;
  progress: number;
  sections: MetricSectionModel[];
  title: string;
  total: number;
}

export interface MetricRowModel {
  label: string;
  value: number;
  variant: RowVariant;
}

export interface MetricSectionModel {
  heading: string;
  // Every section carries a rollup `status` indicator on its heading. Validation
  // blocks (Tier-1, Cell Annotation) also render plain Valid/Invalid count
  // `rows` beneath it; breakdown sections (Processing, CAP, Publication) render
  // their own `rows`.
  rows?: MetricRowModel[];
  status?: SectionStatus;
}

export const ROW_VARIANT = {
  PLAIN: "PLAIN",
  WARNING: "WARNING",
} as const;

export type RowVariant = (typeof ROW_VARIANT)[keyof typeof ROW_VARIANT];

// Rollup status shown on a section heading. ERROR (red) for failures, WARNING
// (amber) for outstanding-but-not-failing work, PASS (green) when all good, and
// PENDING (amber) for a validation block with nothing validated yet.
export const SECTION_STATUS = {
  ERROR: "ERROR",
  PASS: "PASS",
  PENDING: "PENDING",
  WARNING: "WARNING",
} as const;

export type SectionStatus =
  (typeof SECTION_STATUS)[keyof typeof SECTION_STATUS];

export interface StatusDashboardProps {
  summary: AtlasStatusSummary;
}

// A single validation dimension's pass/fail counts, used to roll up a column's
// header badge across every dimension it validates.
export interface ValidationDimension {
  invalid: number;
  valid: number;
}
