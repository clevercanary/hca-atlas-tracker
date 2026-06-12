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
  rows: MetricRowModel[];
}

export const ROW_VARIANT = {
  INVALID: "INVALID",
  PLAIN: "PLAIN",
  VALID: "VALID",
  WARNING: "WARNING",
} as const;

export type RowVariant = (typeof ROW_VARIANT)[keyof typeof ROW_VARIANT];

export interface StatusDashboardProps {
  summary: AtlasStatusSummary;
}

export interface StatusFlagModel {
  label: string;
  value: boolean;
}
