import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { JSX, ReactNode } from "react";
import { AtlasStatusSummary } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { mergeAppTheme } from "../app/theme/theme";
import { StatusDashboard } from "../app/views/AtlasStatusView/components/StatusDashboard/statusDashboard";
import {
  BADGE_VARIANT,
  SECTION_STATUS,
} from "../app/views/AtlasStatusView/components/StatusDashboard/types";
import {
  buildIntegratedObjectsCard,
  getCapStatus,
  getMinValidBadge,
  getValidationStatus,
  getWarningStatus,
} from "../app/views/AtlasStatusView/components/StatusDashboard/utils";

// Theme must include the app-only "caution" palette because mergeAppTheme's
// MuiChip override reads theme.palette.caution when the theme is built.
const THEME = mergeAppTheme(
  createAppTheme({
    palette: { caution: { light: "#FFEB78", main: "#956F00" } },
  }),
);

// A populated summary exercising every badge/row branch: unpublished studies,
// an unspecified-datasets remainder, CAP funnels with published subsets, and
// invalids across multiple validation dimensions.
const SUMMARY: AtlasStatusSummary = {
  integratedObjects: {
    capInvalid: 1,
    capPublished: 2,
    capReady: 1,
    cellAnnotationInvalid: 2,
    cellAnnotationValid: 2,
    tier1Invalid: 1,
    tier1Valid: 3,
    total: 4,
  },
  ocEndorsed: false,
  publishedOnPortal: true,
  sourceDatasets: {
    capInvalid: 5,
    capPublished: 30,
    capReady: 5,
    original: 40,
    reprocessed: 20,
    tier1Invalid: 3,
    tier1Valid: 59,
    total: 62,
  },
  sourceStudies: { published: 3, total: 9, unpublished: 6 },
};

// All-zero atlas — nothing ingested or validated yet.
const ZERO_SUMMARY: AtlasStatusSummary = {
  integratedObjects: {
    capInvalid: 0,
    capPublished: 0,
    capReady: 0,
    cellAnnotationInvalid: 0,
    cellAnnotationValid: 0,
    tier1Invalid: 0,
    tier1Valid: 0,
    total: 0,
  },
  ocEndorsed: false,
  publishedOnPortal: false,
  sourceDatasets: {
    capInvalid: 0,
    capPublished: 0,
    capReady: 0,
    original: 0,
    reprocessed: 0,
    tier1Invalid: 0,
    tier1Valid: 0,
    total: 0,
  },
  sourceStudies: { published: 0, total: 0, unpublished: 0 },
};

function Wrapper({ children }: { children: ReactNode }): JSX.Element {
  return <ThemeProvider theme={THEME}>{children}</ThemeProvider>;
}

describe("StatusDashboard", () => {
  describe("populated summary", () => {
    beforeEach(() => {
      render(<StatusDashboard summary={SUMMARY} />, { wrapper: Wrapper });
    });

    it("renders all three group cards", () => {
      expect(screen.getByText("Source Studies")).toBeInTheDocument();
      expect(screen.getByText("Source Datasets")).toBeInTheDocument();
      expect(screen.getByText("Integrated Objects")).toBeInTheDocument();
    });

    it("renders each group's section headings", () => {
      expect(screen.getByText("Publication Status")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Cell Annotation Metadata")).toBeInTheDocument();
      // CAP and Tier-1 sections appear in both datasets and integrated objects.
      expect(screen.getAllByText("CAP")).toHaveLength(2);
      expect(
        screen.getAllByText("Metadata Validation HCA Tier-1"),
      ).toHaveLength(2);
    });

    it("renders the processing rows including the unspecified remainder", () => {
      // total 62 - original 40 - reprocessed 20 = 2 unspecified.
      expect(screen.getByText("Original")).toBeInTheDocument();
      expect(screen.getByText("Reprocessed")).toBeInTheDocument();
      expect(screen.getByText("Unspecified")).toBeInTheDocument();
    });

    it("renders plain Valid/Invalid count rows in the validation blocks", () => {
      // Valid/Invalid rows appear in the two CAP funnels plus the three
      // validation blocks (datasets Tier-1, integrated objects Tier-1, and
      // integrated objects Cell Annotation) = 5 each.
      expect(screen.getAllByText("Valid")).toHaveLength(5);
      expect(screen.getAllByText("Invalid")).toHaveLength(5);
      // The datasets Tier-1 counts render as plain rows (59 valid / 3 invalid).
      expect(screen.getByText("59")).toBeInTheDocument();
    });

    it("renders the CAP funnel with valid = required - invalid", () => {
      // Source datasets CAP: Required = original (40), Valid = 40 - invalid 5 =
      // 35, Invalid = 5, Published = 30. "40" appears twice (Processing →
      // Original and CAP → Required).
      expect(screen.getByText("Required")).toBeInTheDocument();
      expect(screen.getAllByText("40")).toHaveLength(2);
      expect(screen.getByText("35")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("rolls the header badge up across all validation dimensions", () => {
      expect(screen.getByText("6 unpublished")).toBeInTheDocument();
      // Source datasets: Tier-1 only → 3 invalid.
      expect(screen.getByText("3 invalid")).toBeInTheDocument();
      // Integrated objects: total 4 - smallest section valid (Cell Annotation 2;
      // CAP 4-1=3, Tier-1 3) = 4 - 2 = 2 invalid.
      expect(screen.getByText("2 invalid")).toBeInTheDocument();
    });

    it("does not render the OC Endorsed / Published on Portal flags", () => {
      expect(screen.queryByText("OC Endorsed")).not.toBeInTheDocument();
      expect(screen.queryByText("Published on Portal")).not.toBeInTheDocument();
    });
  });

  describe("zero state", () => {
    beforeEach(() => {
      render(<StatusDashboard summary={ZERO_SUMMARY} />, { wrapper: Wrapper });
    });

    it("renders all three group cards", () => {
      expect(screen.getByText("Source Studies")).toBeInTheDocument();
      expect(screen.getByText("Source Datasets")).toBeInTheDocument();
      expect(screen.getByText("Integrated Objects")).toBeInTheDocument();
    });

    it("renders neutral default badges for an empty atlas", () => {
      expect(screen.getByText("0 source studies")).toBeInTheDocument();
      expect(screen.getByText("0 valid source datasets")).toBeInTheDocument();
      expect(
        screen.getByText("0 valid integrated objects"),
      ).toBeInTheDocument();
    });

    it("uses the neutral default badge, not the green or error count badges", () => {
      expect(screen.queryByText("0 published")).not.toBeInTheDocument();
      expect(screen.queryByText(/ unpublished$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/ invalid$/)).not.toBeInTheDocument();
    });
  });

  // The validation-block heading rollup drives the icon/colour (ERROR red,
  // PASS green, PENDING amber). Any invalid must surface as ERROR — e.g. a
  // block with 0 valid / 46 invalid is red, never amber.
  describe("getValidationStatus", () => {
    it("returns ERROR when there are any invalids, even with zero valid", () => {
      expect(getValidationStatus(0, 46)).toBe(SECTION_STATUS.ERROR);
    });

    it("returns ERROR when invalids exist alongside valids (failures win)", () => {
      expect(getValidationStatus(59, 3)).toBe(SECTION_STATUS.ERROR);
    });

    it("returns PASS when some are valid and none invalid", () => {
      expect(getValidationStatus(10, 0)).toBe(SECTION_STATUS.PASS);
    });

    it("returns PENDING only when nothing has been validated yet", () => {
      expect(getValidationStatus(0, 0)).toBe(SECTION_STATUS.PENDING);
    });
  });

  // CAP headings roll up to error (any failed CAP), green (items required, none
  // failed), or amber (nothing required yet — empty).
  describe("getCapStatus", () => {
    it("returns ERROR when any failed CAP validation", () => {
      expect(getCapStatus(5, 1)).toBe(SECTION_STATUS.ERROR);
    });

    it("returns PASS when items are required and none failed", () => {
      expect(getCapStatus(5, 0)).toBe(SECTION_STATUS.PASS);
    });

    it("returns WARNING when nothing is required yet (empty)", () => {
      expect(getCapStatus(0, 0)).toBe(SECTION_STATUS.WARNING);
    });
  });

  // Breakdown headings (Processing, Publication) roll up to warning (amber)
  // while items are outstanding or none exist yet, and green only once items
  // exist with none outstanding.
  describe("getWarningStatus", () => {
    it("returns WARNING when items remain outstanding", () => {
      expect(getWarningStatus(10, 3)).toBe(SECTION_STATUS.WARNING);
    });

    it("returns PASS when items exist and none are outstanding", () => {
      expect(getWarningStatus(10, 0)).toBe(SECTION_STATUS.PASS);
    });

    it("returns WARNING when the section is empty (nothing exists yet)", () => {
      expect(getWarningStatus(0, 0)).toBe(SECTION_STATUS.WARNING);
    });
  });

  // The integrated objects badge counts the shortfall as total minus the
  // smallest per-section valid (an object must pass every section to be valid),
  // shown red only when there are known invalids, amber when only pending.
  describe("getMinValidBadge", () => {
    it("is red with the shortfall when there are known invalids", () => {
      // total 5, smallest valid 1 → 4 short, and there are known invalids.
      expect(getMinValidBadge(5, [4, 2, 1], 3, "empty")).toEqual({
        label: "4 invalid",
        variant: BADGE_VARIANT.ERROR,
      });
    });

    it("is amber (pending) when the shortfall is only unvalidated sections", () => {
      // total 5, a section is unvalidated (valid 0) but nothing has failed.
      expect(getMinValidBadge(5, [5, 0, 0], 0, "empty")).toEqual({
        label: "5 pending",
        variant: BADGE_VARIANT.CAUTION,
      });
    });

    it("is green when every section is fully valid", () => {
      expect(getMinValidBadge(5, [5, 5, 5], 0, "empty")).toEqual({
        label: "5 valid",
        variant: BADGE_VARIANT.SUCCESS,
      });
    });

    it("uses the neutral empty label when the column is empty", () => {
      expect(getMinValidBadge(0, [0, 0, 0], 0, "empty")).toEqual({
        label: "empty",
        variant: BADGE_VARIANT.DEFAULT,
      });
    });
  });

  // Invalid rows are flagged for an alert background only when the count is > 0.
  describe("invalid row highlight", () => {
    it("highlights invalid rows with a non-zero count", () => {
      const card = buildIntegratedObjectsCard(SUMMARY);
      for (const section of card.sections) {
        const invalidRow = section.rows?.find((row) => row.label === "Invalid");
        if (invalidRow && invalidRow.value > 0) {
          expect(invalidRow.highlight).toBe(true);
        }
      }
      // Valid rows are never highlighted.
      const validRows = card.sections.flatMap((section) =>
        (section.rows ?? []).filter((row) => row.label === "Valid"),
      );
      for (const row of validRows) expect(row.highlight).toBeFalsy();
    });

    it("does not highlight invalid rows with a zero count", () => {
      const card = buildIntegratedObjectsCard(ZERO_SUMMARY);
      const invalidRows = card.sections.flatMap((section) =>
        (section.rows ?? []).filter((row) => row.label === "Invalid"),
      );
      expect(invalidRows.length).toBeGreaterThan(0);
      for (const row of invalidRows) expect(row.highlight).toBe(false);
    });
  });
});
