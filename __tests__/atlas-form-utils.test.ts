import { UNPUBLISHED } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  type HCAAtlasTrackerAtlas,
  SYSTEM,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getDOIUrl,
  renderCellxGeneCollectionHelperText,
  renderDOIHelperText,
  renderMetadataSpecificationHelperText,
} from "@/app/components/Forms/components/Atlas/common/utils";
import { PUBLICATION_NORMAL } from "@/testing/constants";

const TASK_COUNTS = { completedCount: 0, count: 0 };

const ATLAS: HCAAtlasTrackerAtlas = {
  bioNetwork: "lung",
  capId: null,
  cellxgeneAtlasCollection: null,
  cellxgeneAtlasCollectionTitle: "CELLxGENE Collection",
  codeLinks: [],
  completedTaskCount: 0,
  componentAtlasCount: 0,
  description: "",
  entrySheetValidationCount: 0,
  generation: 1,
  highlights: "",
  id: "atlas-id",
  ingestionTaskCounts: {
    [SYSTEM.CAP]: TASK_COUNTS,
    [SYSTEM.CELLXGENE]: TASK_COUNTS,
    [SYSTEM.HCA_DATA_REPOSITORY]: TASK_COUNTS,
  },
  integrationLead: [],
  isLatest: true,
  metadataCorrectnessUrl: null,
  metadataSpecificationTitle: "Metadata Specification",
  metadataSpecificationUrl: null,
  publications: [{ doi: "10.123/test", publication: PUBLICATION_NORMAL }],
  publishedAt: null,
  revision: 1,
  shortName: "test",
  shortNameSlug: "test",
  sourceDatasetCount: 0,
  sourceStudyCount: 0,
  status: ATLAS_STATUS.IN_PROGRESS,
  targetCompletion: null,
  taskCount: 0,
  title: "Test Atlas",
  wave: "1",
};

const ATLAS_WITHOUT_TITLES: HCAAtlasTrackerAtlas = {
  ...ATLAS,
  cellxgeneAtlasCollectionTitle: null,
  metadataSpecificationTitle: null,
  publications: [],
};

describe("getDOIUrl", () => {
  it("returns a doi.org URL for a DOI", () => {
    expect(getDOIUrl("10.123/test")).toBe("https://doi.org/10.123%2Ftest");
  });

  it("returns a doi.org URL unchanged", () => {
    expect(getDOIUrl("https://doi.org/10.123/test")).toBe(
      "https://doi.org/10.123/test",
    );
  });

  it("returns null for a null DOI", () => {
    expect(getDOIUrl(null)).toBeNull();
  });

  it("returns null for an empty DOI", () => {
    expect(getDOIUrl("")).toBeNull();
  });

  it("returns null for an unpublished DOI", () => {
    expect(getDOIUrl(UNPUBLISHED)).toBeNull();
  });
});

describe("renderCellxGeneCollectionHelperText", () => {
  it("returns the CELLxGENE collection title", () => {
    expect(renderCellxGeneCollectionHelperText(ATLAS)).toBe(
      "CELLxGENE Collection",
    );
  });

  it("returns null when the atlas has no CELLxGENE collection title", () => {
    expect(
      renderCellxGeneCollectionHelperText(ATLAS_WITHOUT_TITLES),
    ).toBeNull();
  });

  it("returns undefined when there is no atlas", () => {
    expect(renderCellxGeneCollectionHelperText(undefined)).toBeUndefined();
  });
});

describe("renderDOIHelperText", () => {
  it("returns the citation of the first publication", () => {
    expect(renderDOIHelperText(ATLAS)).toBe("Foo (2024) Bar");
  });

  it("returns an empty string when the atlas has no publications", () => {
    expect(renderDOIHelperText(ATLAS_WITHOUT_TITLES)).toBe("");
  });

  it("returns an empty string when there is no atlas", () => {
    expect(renderDOIHelperText(undefined)).toBe("");
  });
});

describe("renderMetadataSpecificationHelperText", () => {
  it("returns the metadata specification title", () => {
    expect(renderMetadataSpecificationHelperText(ATLAS)).toBe(
      "Metadata Specification",
    );
  });

  it("returns null when the atlas has no metadata specification title", () => {
    expect(
      renderMetadataSpecificationHelperText(ATLAS_WITHOUT_TITLES),
    ).toBeNull();
  });

  it("returns undefined when there is no atlas", () => {
    expect(renderMetadataSpecificationHelperText(undefined)).toBeUndefined();
  });
});
