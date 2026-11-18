import {
  type Heatmap,
  type HeatmapClass,
  type HeatmapEntrySheet,
  type NetworkKey,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { endPgPool } from "@/app/services/database";
import {
  getAttributeBioNetworks,
  getDataDictionaryClass,
} from "@/app/utils/data-dictionary";
import heatmapHandler from "@/pages/api/atlases/[atlasId]/heatmap";
import {
  ATLAS_HEATMAP_GUT_TEST,
  ATLAS_HEATMAP_TEST,
  ATLAS_NONEXISTENT,
  ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE,
  ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY,
  ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL,
  ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "@/testing/constants";
import { resetDatabase } from "@/testing/db-utils";
import { type TestUser } from "@/testing/entities";
import {
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "@/testing/utils";
import { type NextApiRequest, type NextApiResponse } from "next";
import httpMocks from "node-mocks-http";

jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/heatmap";

const HEATMAP_CLASS_TITLES = ["Dataset", "Donor", "Sample"] as const;

type HeatmapClassTitle = (typeof HEATMAP_CLASS_TITLES)[number];

const GUT_SPECIFIC_FIELDS: Record<HeatmapClassTitle, string[]> = {
  Dataset: ["ambient_count_correction", "doublet_detection"],
  Donor: [],
  Sample: ["dissociation_protocol", "radial_tissue_term"],
};

const NO_ORGAN_SPECIFIC_FIELDS: Record<HeatmapClassTitle, string[]> = {
  Dataset: [],
  Donor: [],
  Sample: [],
};

function getExpectedHeatmapClasses(
  network: NetworkKey,
): Pick<HeatmapClass, "sheets" | "title">[] {
  return [
    {
      sheets: [
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("dataset", network, 10, {
              dataset_id: 9,
              title: 0,
            }),
            rowCount: 10,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE.entry_sheet_title,
        },
        {
          correctness: null,
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL.entry_sheet_id,
        },
        {
          correctness: null,
          title: ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY.entry_sheet_title,
        },
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("dataset", network, 5),
            rowCount: 5,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT.entry_sheet_title,
        },
      ],
      title: "Dataset",
    },
    {
      sheets: [
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("donor", network, 5, {
              organism_ontology_term_id: 4,
            }),
            rowCount: 5,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE.entry_sheet_title,
        },
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("donor", network, 3, {
              organism_ontology_term_id: 1,
            }),
            rowCount: 3,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL.entry_sheet_id,
        },
        {
          correctness: null,
          title: ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY.entry_sheet_title,
        },
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("donor", network, 3),
            rowCount: 3,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT.entry_sheet_title,
        },
      ],
      title: "Donor",
    },
    {
      sheets: [
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("sample", network, 15, {
              tissue_ontology_term_id: 14,
            }),
            rowCount: 15,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE.entry_sheet_title,
        },
        {
          correctness: null,
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL.entry_sheet_id,
        },
        {
          correctness: null,
          title: ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY.entry_sheet_title,
        },
        {
          correctness: {
            correctCounts: makeExpectedCorrectCounts("sample", network, 8),
            rowCount: 8,
          },
          title: ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT.entry_sheet_title,
        },
      ],
      title: "Sample",
    },
  ];
}

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_HEATMAP_TEST.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when heatmap is requested by logged out user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_HEATMAP_TEST.id,
          undefined,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when heatmap is requested by unregistered user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_HEATMAP_TEST.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when heatmap is requested by disabled user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_HEATMAP_TEST.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when heatmap is requested from nonexistent atlas", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_NONEXISTENT.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns heatmap based on entry sheet validations",
      TEST_ROUTE,
      heatmapHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_HEATMAP_TEST.id),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const heatmap = res._getJSONData() as Heatmap;
        expectHeatmapToMatch(heatmap, getExpectedHeatmapClasses("eye"));
      },
    );
  }

  it("returns heatmap based on entry sheet validations when requested by content admin", async () => {
    const res = await doHeatmapRequest(
      ATLAS_HEATMAP_TEST.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const heatmap = res._getJSONData() as Heatmap;
    expectHeatmapToMatch(heatmap, getExpectedHeatmapClasses("eye"));
  });

  it("leaves out fields specific to other networks and marks no field organ-specific for an eye atlas", async () => {
    const res = await doHeatmapRequest(
      ATLAS_HEATMAP_TEST.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const heatmap = res._getJSONData() as Heatmap;
    for (const title of HEATMAP_CLASS_TITLES) {
      const fieldNames = getHeatmapClass(heatmap, title).fields.map(
        (f) => f.name,
      );
      for (const name of GUT_SPECIFIC_FIELDS[title]) {
        expect(fieldNames).not.toContain(name);
      }
    }
    expectOrganSpecificFields(heatmap, NO_ORGAN_SPECIFIC_FIELDS);
  });

  it("returns heatmap with gut-specific fields marked organ-specific for a gut atlas", async () => {
    const res = await doHeatmapRequest(
      ATLAS_HEATMAP_GUT_TEST.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const heatmap = res._getJSONData() as Heatmap;
    expectHeatmapToMatch(heatmap, getExpectedHeatmapClasses("gut"));
    expectOrganSpecificFields(heatmap, GUT_SPECIFIC_FIELDS);
  });
});

function getHeatmapClass(
  heatmap: Heatmap,
  title: HeatmapClassTitle,
): HeatmapClass {
  const heatmapClass = heatmap.classes.find((c) => c.title === title);
  if (!heatmapClass) throw new Error(`Heatmap missing ${title} class`);
  return heatmapClass;
}

function expectOrganSpecificFields(
  heatmap: Heatmap,
  organSpecificFields: Record<HeatmapClassTitle, string[]>,
): void {
  for (const title of HEATMAP_CLASS_TITLES) {
    const { fields } = getHeatmapClass(heatmap, title);
    const expectedNames = organSpecificFields[title];
    expect(fields.map((f) => f.name)).toEqual(
      expect.arrayContaining(expectedNames),
    );
    for (const field of fields) {
      const isOrganSpecific = expectedNames.includes(field.name);
      expect(field.organSpecific).toEqual(isOrganSpecific);
      if (isOrganSpecific) expect(field.required).toEqual(true);
    }
  }
}

function expectHeatmapToMatch(
  heatmap: Heatmap,
  expectedClasses: Pick<HeatmapClass, "sheets" | "title">[],
): void {
  expect(heatmap.classes).toHaveLength(expectedClasses.length);
  for (const expectedClass of expectedClasses) {
    const heatmapClass = heatmap.classes.find(
      (c) => c.title === expectedClass.title,
    );
    if (!expectIsDefined(heatmapClass)) return;
    expectHeatmapSheetsToMatch(heatmapClass.sheets, expectedClass.sheets);
  }
}

function expectHeatmapSheetsToMatch(
  heatmapSheets: HeatmapEntrySheet[],
  expectedSheets: HeatmapEntrySheet[],
): void {
  expect(heatmapSheets).toHaveLength(expectedSheets.length);
  for (const expectedSheet of expectedSheets) {
    const heatmapSheet = heatmapSheets.find(
      (s) => s.title === expectedSheet.title,
    );
    if (!expectIsDefined(heatmapSheet)) return;
    expect(heatmapSheet).toEqual(expectedSheet);
  }
}

async function doHeatmapRequest(
  atlasId: string,
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { cookie: user?.cookie },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => heatmapHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}

function makeExpectedCorrectCounts(
  entityType: string,
  network: NetworkKey,
  rowCount: number,
  nonFullCounts: Record<string, number> = {},
): Record<string, number> {
  const ddClass = getDataDictionaryClass(entityType);
  const fullCounts = Object.fromEntries(
    ddClass.attributes
      .filter((a) => getAttributeBioNetworks(a).includes(network))
      .map((a) => [a.name, rowCount]),
  );
  return { ...fullCounts, ...nonFullCounts };
}
