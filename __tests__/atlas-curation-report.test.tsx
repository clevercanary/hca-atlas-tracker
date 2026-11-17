import { CurationReport } from "@/app/views/AtlasStatusView/components/CurationReport/curationReport";
import HEART_V1_REPORT from "@/app/views/AtlasStatusView/components/CurationReport/fixtures/heartV1.json";
import {
  type CurationReport as CurationReportData,
  type ReportIssue,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  describeValidator,
  getClearedChecks,
  getFileRows,
  getIssueCounts,
  getIssuesByPriority,
  getOwnersByCount,
  getSharedIssues,
  getVerdictCounts,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { TEST_THEME } from "@/testing/theme";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";

const getFileHref = (stem?: string): string =>
  stem ? `/status?file=${stem}` : "/status";

const ETHNICITY: ReportIssue = {
  category: "Metadata",
  detail: "obs carries a forbidden column.",
  evidence: null,
  id: "forbidden-ethnicity-column",
  owner: "curation tool",
  priority: 1,
  title: "Forbidden ethnicity column",
  tool: "strip_forbidden_obs_columns",
};

const CAP: ReportIssue = {
  category: "Metadata",
  detail: "No CAP annotation sets.",
  evidence: null,
  id: "cap-missing",
  owner: "producer",
  priority: 1,
  title: "CAP annotations missing",
  tool: null,
};

const LABELS: ReportIssue = {
  category: "Metadata",
  detail: "No derived labels.",
  evidence: null,
  id: "labels-not-populated",
  owner: "curation tool",
  priority: 3,
  title: "Labels not populated",
  tool: "populate_labels",
};

const PASS_DUPLICATES = {
  detail: "check_duplicate_cells is clean.",
  id: "no-duplicate-cells",
};
const PASS_COMPRESSED = { detail: "gzip level 4.", id: "compressed" };

// Fields only the file detail reads.
const DETAIL = {
  facts: {
    capStatus: "CAP_READY",
    cellAnnotationValidator: { errors: 1, valid: false, warnings: 0 },
    donors: 4,
    genes: 2000,
    hasRawX: true,
    libraries: 6,
    samples: 5,
    schemaValidator: null,
    size: "12.0 MB",
    title: "Test study",
    trackerRevision: "r1-wip-1",
    xState: "normalized",
  },
  genes: {
    byClass: { rename: 2 },
    items: [],
    notInGencode: 2,
    summary: "2 gene IDs are not in GENCODE v48.",
  },
  sourceComparison: null,
  verdictReason: "The tracker holds the file as invalid.",
};

// Three files: the ethnicity column is in all three, CAP in the one object,
// labels in two; one source dataset has not been started.
const REPORT: CurationReportData = {
  atlasTitle: "Test v1",
  checks: {
    compressed: { note: "Gzip.", title: "Compressed" },
    "no-duplicate-cells": { note: "None.", title: "No duplicate cells" },
  },
  files: [
    {
      cells: 1200,
      displayName: "Object A",
      ...DETAIL,
      fileStem: "object-a-r1-wip-1",
      kind: "integrated_object",
      looksGood: [PASS_DUPLICATES, PASS_COMPRESSED],
      needsWork: [ETHNICITY, CAP, LABELS],
      verdict: "needs work",
    },
    {
      cells: 300,
      displayName: "Source B",
      ...DETAIL,
      fileStem: "source-b-r1-wip-1",
      kind: "source_dataset",
      looksGood: [PASS_DUPLICATES],
      needsWork: [ETHNICITY, LABELS],
      verdict: "needs work",
    },
    {
      cells: 40,
      displayName: "Source C",
      ...DETAIL,
      fileStem: "source-c-r1-wip-1",
      kind: "source_dataset",
      looksGood: [PASS_DUPLICATES],
      needsWork: [{ ...ETHNICITY, priority: 2 }],
      verdict: "not started",
    },
  ],
  generation: 1,
  issueNotes: { "cap-missing": "CAP is required for integrated objects." },
  lede: "Three files were evaluated.",
  reportDate: "2026-11-14",
};

describe("getSharedIssues", () => {
  it("orders issues by priority, then by file count, keeping the highest priority seen", () => {
    const shared = getSharedIssues(REPORT);
    expect(
      shared.map((issue) => [issue.id, issue.files.length, issue.priority]),
    ).toEqual([
      ["forbidden-ethnicity-column", 3, 1],
      ["cap-missing", 1, 1],
      ["labels-not-populated", 2, 3],
    ]);
  });

  it("lists each affected file once, in report order", () => {
    const [object, ...sources] = REPORT.files;
    const shared = getSharedIssues({
      ...REPORT,
      files: [{ ...object, needsWork: [ETHNICITY, ETHNICITY] }, ...sources],
    });
    expect(shared[0].files).toEqual([
      { displayName: "Object A", fileStem: "object-a-r1-wip-1" },
      { displayName: "Source B", fileStem: "source-b-r1-wip-1" },
      { displayName: "Source C", fileStem: "source-c-r1-wip-1" },
    ]);
  });

  it("uses the atlas note where one exists and the file's detail otherwise", () => {
    const shared = getSharedIssues(REPORT);
    expect(shared[1].note).toBe("CAP is required for integrated objects.");
    expect(shared[0].note).toBe("obs carries a forbidden column.");
  });
});

describe("getIssueCounts", () => {
  it("counts every open issue by priority and owner", () => {
    expect(getIssueCounts(REPORT.files)).toEqual({
      byOwner: { "curation tool": 5, producer: 1, wrangler: 0 },
      byPriority: { 1: 3, 2: 1, 3: 2 },
      total: 6,
    });
  });
});

describe("getClearedChecks", () => {
  it("counts the files passing each check, most widely passed first", () => {
    expect(getClearedChecks(REPORT)).toEqual([
      { id: "no-duplicate-cells", passed: 3, title: "No duplicate cells" },
      { id: "compressed", passed: 1, title: "Compressed" },
    ]);
  });
});

describe("getVerdictCounts", () => {
  it("counts files by verdict, including verdicts no file has", () => {
    expect(getVerdictCounts(REPORT.files)).toEqual({
      "needs work": 2,
      "not started": 1,
      ready: 0,
    });
  });
});

describe("getFileRows", () => {
  it("counts each file's issues by priority", () => {
    expect(getFileRows(REPORT.files).map((row) => row.priorities)).toEqual([
      { 1: 2, 2: 0, 3: 1 },
      { 1: 1, 2: 0, 3: 1 },
      { 1: 0, 2: 1, 3: 0 },
    ]);
  });
});

describe("getOwnersByCount", () => {
  it("orders owners by issue count, largest first", () => {
    expect(
      getOwnersByCount({ "curation tool": 5, producer: 1, wrangler: 2 }),
    ).toEqual([
      ["curation tool", 5],
      ["wrangler", 2],
      ["producer", 1],
    ]);
  });
});

describe("CurationReport", () => {
  it("renders the summary, the shared issues and a row per file", () => {
    render(
      <ThemeProvider theme={TEST_THEME}>
        <CurationReport getFileHref={getFileHref} report={REPORT} />
      </ThemeProvider>,
    );
    expect(screen.getByText("0 of 3 ready")).toBeInTheDocument();
    expect(screen.getByText("Forbidden ethnicity column")).toBeInTheDocument();
    expect(screen.getByText("3 files")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Source B" })).toHaveAttribute(
      "href",
      "/status?file=source-b-r1-wip-1",
    );
  });

  it("opens a shared issue to links to the files it affects", () => {
    render(
      <ThemeProvider theme={TEST_THEME}>
        <CurationReport getFileHref={getFileHref} report={REPORT} />
      </ThemeProvider>,
    );
    const toggle = screen
      .getByText("Forbidden ethnicity column")
      .closest("[aria-expanded]");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: "Source C" })).toHaveLength(1);
    fireEvent.click(screen.getByText("Forbidden ethnicity column"));
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const fileList = screen.getByRole("list");
    expect(
      within(fileList)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Object A", "/status?file=object-a-r1-wip-1"],
      ["Source B", "/status?file=source-b-r1-wip-1"],
      ["Source C", "/status?file=source-c-r1-wip-1"],
    ]);
  });

  it("renders one file's evaluation when its stem is selected", () => {
    render(
      <ThemeProvider theme={TEST_THEME}>
        <CurationReport
          fileStem="object-a-r1-wip-1"
          getFileHref={getFileHref}
          report={REPORT}
        />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Object A" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CAP annotations missing")).toBeInTheDocument();
    expect(
      screen.getByText("Invalid · 1 errors, 0 warnings"),
    ).toBeInTheDocument();
    expect(screen.getByText("Not run")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← Curation report" }),
    ).toHaveAttribute("href", "/status");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("getIssuesByPriority", () => {
  it("groups a file's issues by priority, leaving out empty priorities", () => {
    expect(
      getIssuesByPriority(REPORT.files[0]).map(([priority, issues]) => [
        priority,
        issues.map((i) => i.id),
      ]),
    ).toEqual([
      [1, ["forbidden-ethnicity-column", "cap-missing"]],
      [3, ["labels-not-populated"]],
    ]);
  });
});

describe("describeValidator", () => {
  it("says when a validator did not run", () => {
    expect(describeValidator(null)).toBe("Not run");
  });

  it("gives the verdict and the counts", () => {
    expect(describeValidator({ errors: 0, valid: true, warnings: 3 })).toBe(
      "Valid · 0 errors, 3 warnings",
    );
  });
});

describe("Heart v1 fixture", () => {
  it("renders the report and every file's evaluation", () => {
    const report = HEART_V1_REPORT as unknown as CurationReportData;
    const { unmount } = render(
      <ThemeProvider theme={TEST_THEME}>
        <CurationReport getFileHref={getFileHref} report={report} />
      </ThemeProvider>,
    );
    expect(screen.getAllByRole("row")).toHaveLength(report.files.length + 1);
    unmount();
    for (const file of report.files) {
      const view = render(
        <ThemeProvider theme={TEST_THEME}>
          <CurationReport
            fileStem={file.fileStem}
            getFileHref={getFileHref}
            report={report}
          />
        </ThemeProvider>,
      );
      expect(
        screen.getByRole("heading", { name: file.displayName }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });
});
