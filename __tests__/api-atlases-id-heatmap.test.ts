import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  Heatmap,
  HeatmapClass,
  HeatmapEntrySheet,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import dataDictionary from "../catalog/downloaded/data-dictionary.json";
import heatmapHandler from "../pages/api/atlases/[atlasId]/heatmap";
import {
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
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/heatmap";

const EXPECTED_HEATMAP_CLASSES: Pick<HeatmapClass, "sheets" | "title">[] = [
  {
    sheets: [
      {
        correctness: {
          correctCounts: makeExpectedCorrectCounts("dataset", 10, {
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
          correctCounts: makeExpectedCorrectCounts("dataset", 5),
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
          correctCounts: makeExpectedCorrectCounts("donor", 5, {
            organism_ontology_term_id: 4,
          }),
          rowCount: 5,
        },
        title: ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE.entry_sheet_title,
      },
      {
        correctness: {
          correctCounts: makeExpectedCorrectCounts("donor", 3, {
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
          correctCounts: makeExpectedCorrectCounts("donor", 3),
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
          correctCounts: makeExpectedCorrectCounts("sample", 15, {
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
          correctCounts: makeExpectedCorrectCounts("sample", 8),
          rowCount: 8,
        },
        title: ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT.entry_sheet_title,
      },
    ],
    title: "Sample",
  },
];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
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
        expectHeatmapToMatch(heatmap, EXPECTED_HEATMAP_CLASSES);
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
    expectHeatmapToMatch(heatmap, EXPECTED_HEATMAP_CLASSES);
  });
});

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
    headers: { authorization: user?.authorization },
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
  rowCount: number,
  nonFullCounts: Record<string, number> = {},
): Record<string, number> {
  const ddClass = dataDictionary.classes.find((c) => c.name === entityType);
  if (!ddClass) throw new Error(`Data dictionary missing ${entityType} class`);
  const fullCounts = Object.fromEntries(
    ddClass.attributes.map((a) => [a.name, rowCount]),
  );
  return { ...fullCounts, ...nonFullCounts };
}
