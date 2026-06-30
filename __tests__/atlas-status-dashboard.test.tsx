import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { JSX, ReactNode } from "react";
import { AtlasStatusSummary } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { mergeAppTheme } from "../app/theme/theme";
import { StatusDashboard } from "../app/views/AtlasStatusView/components/StatusDashboard/statusDashboard";
import { SECTION_STATUS } from "../app/views/AtlasStatusView/components/StatusDashboard/types";
import { getValidationStatus } from "../app/views/AtlasStatusView/components/StatusDashboard/utils";

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
    cellAnnotationInvalid: 1,
    cellAnnotationValid: 1,
    tier1Invalid: 1,
    tier1Valid: 1,
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
      // Integrated objects: Tier-1 (1) + Cell Annotation (1) → 2 invalid.
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
});
