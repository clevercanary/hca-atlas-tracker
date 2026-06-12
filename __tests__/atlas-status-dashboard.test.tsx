import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { JSX, ReactNode } from "react";
import { AtlasStatusSummary } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { mergeAppTheme } from "../app/theme/theme";
import { StatusDashboard } from "../app/views/AtlasStatusView/components/StatusDashboard/statusDashboard";

// Theme must include the app-only "caution" palette because mergeAppTheme's
// MuiChip override reads theme.palette.caution when the theme is built.
const THEME = mergeAppTheme(
  createAppTheme({
    palette: { caution: { light: "#FFEB78", main: "#956F00" } },
  }),
);

// A populated summary exercising every badge/row branch: unpublished studies,
// an unspecified-datasets remainder, tier-1 invalids, and boolean flags.
const SUMMARY: AtlasStatusSummary = {
  integratedObjects: {
    capInvalid: 1,
    capPublished: 0,
    capReady: 2,
    cellAnnotationInvalid: 1,
    cellAnnotationValid: 1,
    tier1Invalid: 1,
    tier1Valid: 1,
    total: 4,
  },
  ocEndorsed: false,
  publishedOnPortal: true,
  sourceDatasets: {
    capInvalid: 0,
    capPublished: 58,
    capReady: 60,
    original: 40,
    reprocessed: 20,
    tier1Invalid: 3,
    tier1Valid: 59,
  sourceStudies: { published: 3, total: 9, unpublished: 6 },

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

    it("renders badges reflecting the counts", () => {
      expect(screen.getByText("5 unpublished")).toBeInTheDocument();
      expect(screen.getByText("3 Tier-1 invalid")).toBeInTheDocument();
      expect(screen.getByText("1 Tier-1 invalid")).toBeInTheDocument();
    });

    it("renders the status flags as Yes/No", () => {
      expect(screen.getByText("OC Endorsed")).toBeInTheDocument();
      expect(screen.getByText("Published on Portal")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toBeInTheDocument(); // Published on Portal
      expect(screen.getByText("No")).toBeInTheDocument(); // OC Endorsed
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

    it("uses the neutral default badge, not the green published or count badges", () => {
      expect(screen.queryByText("0 published")).not.toBeInTheDocument();
      expect(screen.queryByText(/ unpublished$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/ Tier-1 invalid$/)).not.toBeInTheDocument();
    });
  });
});
