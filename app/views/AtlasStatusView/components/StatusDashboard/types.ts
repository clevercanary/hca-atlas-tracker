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
  // A validation block (e.g. Tier-1, Cell Annotation) carries both a single
  // rollup `status` indicator on its heading and plain Valid/Invalid count
  // `rows` beneath it. Breakdown sections (Processing, CAP, Publication) carry
  // only `rows`, with no heading `status`.
  rows?: MetricRowModel[];
  status?: SectionStatus;
}

export const ROW_VARIANT = {
  PLAIN: "PLAIN",
  WARNING: "WARNING",
} as const;

export type RowVariant = (typeof ROW_VARIANT)[keyof typeof ROW_VARIANT];

// Rollup status for a validation block, driven by its valid/invalid counts:
// any invalid → ERROR, else any valid → PASS, else nothing validated → PENDING.
export const SECTION_STATUS = {
  ERROR: "ERROR",
  PASS: "PASS",
  PENDING: "PENDING",
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
