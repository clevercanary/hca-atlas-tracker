import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { FILE_VALIDATOR_NAMES } from "../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  AtlasStatusSummary,
  DOI_STATUS,
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileValidationSummary,
  FileValidatorName,
  REPROCESSED_STATUS,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { doTransaction, endPgPool } from "../app/services/database";
import statusHandler from "../pages/api/atlases/[atlasId]/status";
import {
  ATLAS_NONEXISTENT,
  STAKEHOLDER_ANALOGOUS_ROLES,
  TEST_S3_BUCKET,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  initAtlases,
  initComponentAtlases,
  initFiles,
  initSourceDatasets,
  initSourceStudies,
  initUsers,
  resetDatabase,
} from "../testing/db-utils";
import {
  TestAtlas,
  TestComponentAtlas,
  TestSourceDataset,
  TestSourceStudy,
  TestUser,
} from "../testing/entities";
import {
  makeTestUser,
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

const ATLAS_ID_MAIN = "0325474a-a038-4201-9651-f8f7406c3483";
const ATLAS_ID_ENDORSED = "ca70b4e8-ed0b-49ed-a683-9b78f20e0afa";
const ATLAS_ID_PUBLISHED = "45c6ff6d-d138-4975-9e7d-dbac59e6327c";
const ATLAS_ID_ENDORSED_PUBLISHED = "3594fded-6785-4382-9a95-5c2b9bda5073";

const INTEGRATION_LEAD = makeTestUser(
  "test-integration-lead-atlas-status",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_MAIN],
);

const BASE_COMPONENT_ATLAS_ID = 0x9975ea7e331a429eacc2205368a6b645n;
const BASE_COMPONENT_ATLAS_VERSION = 0x9e4697125b494b9cbd0fe34df2459a12n;
const BASE_COMPONENT_ATLAS_FILE_ID = 0xee29c0e18fe44cbc864b7d8de45f058dn;

const COMPONENT_ATLAS_HANDLERS: ((
  componentAtlas: TestComponentAtlas,
  i: number,
) => TestComponentAtlas)[] = [
  // No categories
  (componentAtlas): TestComponentAtlas => componentAtlas,
  // CAP ready
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: true,
    }),
  // CAP invalid
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: false,
    }),
  // CAP published
  (componentAtlas, i): TestComponentAtlas => ({
    ...addValidationResults(componentAtlas, {
      cap: true,
    }),
    capUrl: makeTestComponentAtlasCapUrl(i),
  }),
  // CAP invalid
  (componentAtlas, i): TestComponentAtlas => ({
    ...addValidationResults(componentAtlas, {
      cap: false,
    }),
    capUrl: makeTestComponentAtlasCapUrl(i),
  }),
  // CAP ready, Tier 1 valid, cell annotation invalid
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: true,
      hcaCellAnnotation: false,
      hcaSchema: true,
    }),
  // CAP ready, Tier 1 invalid
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: true,
      hcaSchema: false,
    }),
  // CAP invalid, cell annotation valid
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: false,
      hcaCellAnnotation: true,
    }),
  // CAP invalid, cell annotation invalid
  (componentAtlas): TestComponentAtlas =>
    addValidationResults(componentAtlas, {
      cap: false,
      hcaCellAnnotation: false,
    }),
  // CAP published, Tier 1 valid
  (componentAtlas, i): TestComponentAtlas => ({
    ...addValidationResults(componentAtlas, {
      cap: true,
      hcaSchema: true,
    }),
    capUrl: makeTestComponentAtlasCapUrl(i),
  }),
  // Not counted
  (componentAtlas): TestComponentAtlas => ({
    ...componentAtlas,
    file: {
      ...componentAtlas.file,
      isArchived: true,
    },
  }),
];

const BASE_SOURCE_DATASET_ID = 0x33746d883f854bfda9ddb899a74b5e8cn;
const BASE_SOURCE_DATASET_VERSION = 0xee4a3c819120423bbac1696ced05dd4dn;
const BASE_SOURCE_DATASET_FILE_ID = 0x3168eefc3db14fd49c8f8de4de697a27n;

const SOURCE_DATASET_HANDLERS: ((
  sourceDataset: TestSourceDataset,
  i: number,
) => TestSourceDataset)[] = [
  // No categories
  (sourceDataset): TestSourceDataset => sourceDataset,
  // No categories
  (sourceDataset): TestSourceDataset =>
    addValidationResults(sourceDataset, {
      cap: true,
    }),
  // Reprocessed
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: true,
    }),
    reprocessedStatus: REPROCESSED_STATUS.REPROCESSED,
  }),
  // Original, CAP ready
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: true,
    }),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Original, CAP ready
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(
      sourceDataset,
      {
        cap: true,
      },
      FILE_VALIDATION_STATUS.REQUESTED,
    ),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // No categories
  (sourceDataset): TestSourceDataset =>
    addValidationResults(sourceDataset, {
      cap: false,
    }),
  // Reprocessed
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: false,
    }),
    reprocessedStatus: REPROCESSED_STATUS.REPROCESSED,
  }),
  // Original, CAP invalid
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: false,
    }),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Reprocessed
  (sourceDataset, i): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: true,
    }),
    capUrl: makeTestSourceDatasetCapUrl(i),
    reprocessedStatus: REPROCESSED_STATUS.REPROCESSED,
  }),
  // Original, CAP published
  (sourceDataset, i): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: true,
    }),
    capUrl: makeTestSourceDatasetCapUrl(i),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Original, Tier 1 valid
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      hcaSchema: true,
    }),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Original, Tier 1 invalid
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      hcaSchema: false,
    }),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Original, Tier 1 invalid, CAP ready
  (sourceDataset): TestSourceDataset => ({
    ...addValidationResults(sourceDataset, {
      cap: true,
      hcaSchema: false,
    }),
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  }),
  // Not counted
  (sourceDataset): TestSourceDataset => ({
    ...sourceDataset,
    file: {
      ...sourceDataset.file,
      isArchived: true,
    },
  }),
];

const BASE_SOURCE_STUDY_ID = 0x473b6a1e90914cd8aafc2a66402e691dn;

const SOURCE_STUDIES: Array<{ published: boolean }> = [
  { published: true },
  { published: true },
  { published: false },
  { published: false },
  { published: true },
];

const DEFAULT_STATUS_SUMMARY: AtlasStatusSummary = {
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
  sourceStudies: {
    published: 0,
    total: 0,
    unpublished: 0,
  },
};

const EXPECTED_MAIN_STATUS_SUMMARY: AtlasStatusSummary = {
  ...DEFAULT_STATUS_SUMMARY,
  integratedObjects: {
    capInvalid: 4,
    capPublished: 2,
    capReady: 3,
    cellAnnotationInvalid: 2,
    cellAnnotationValid: 1,
    tier1Invalid: 1,
    tier1Valid: 2,
    total: 10,
  },
  sourceDatasets: {
    capInvalid: 1,
    capPublished: 1,
    capReady: 3,
    original: 7,
    reprocessed: 3,
    tier1Invalid: 2,
    tier1Valid: 1,
    total: 13,
  },
  sourceStudies: {
    published: 3,
    total: 5,
    unpublished: 2,
  },
};

const TEST_ROUTE = "/api/atlases/[atlasId]/status";

beforeAll(async () => {
  await resetDatabase(false);
  await initStatusTestEntities();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doStatusRequest(ATLAS_ID_MAIN, USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when status summary is requested by logged out user", async () => {
    expect(
      (
        await doStatusRequest(ATLAS_ID_MAIN, undefined, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when status summary is requested by unregistered user", async () => {
    expect(
      (
        await doStatusRequest(
          ATLAS_ID_MAIN,
          USER_UNREGISTERED,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when status summary is requested by disabled user", async () => {
    expect(
      (
        await doStatusRequest(
          ATLAS_ID_MAIN,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when status summary is requested from nonexistent atlas", async () => {
    expect(
      (
        await doStatusRequest(
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
      "returns status summary",
      TEST_ROUTE,
      statusHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_ID_MAIN),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const summary = res._getJSONData() as AtlasStatusSummary;
        expect(summary).toEqual(EXPECTED_MAIN_STATUS_SUMMARY);
      },
      {
        usersByRole: {
          [ROLE.INTEGRATION_LEAD]: INTEGRATION_LEAD,
        },
      },
    );
  }

  it("returns status summary when requested by content admin", async () => {
    const res = await doStatusRequest(
      ATLAS_ID_MAIN,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const summary = res._getJSONData() as AtlasStatusSummary;
    expect(summary).toEqual(EXPECTED_MAIN_STATUS_SUMMARY);
  });

  it("returns status summary for OC endorsed atlas", async () => {
    const res = await doStatusRequest(
      ATLAS_ID_ENDORSED,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const summary = res._getJSONData() as AtlasStatusSummary;
    expect(summary).toEqual({
      ...DEFAULT_STATUS_SUMMARY,
      ocEndorsed: true,
    });
  });

  it("returns status summary for published atlas", async () => {
    const res = await doStatusRequest(
      ATLAS_ID_PUBLISHED,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const summary = res._getJSONData() as AtlasStatusSummary;
    expect(summary).toEqual({
      ...DEFAULT_STATUS_SUMMARY,
      publishedOnPortal: true,
    });
  });

  it("returns status summary for published OC endorsed atlas", async () => {
    const res = await doStatusRequest(
      ATLAS_ID_ENDORSED_PUBLISHED,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const summary = res._getJSONData() as AtlasStatusSummary;
    expect(summary).toEqual({
      ...DEFAULT_STATUS_SUMMARY,
      ocEndorsed: true,
      publishedOnPortal: true,
    });
  });
});

async function doStatusRequest(
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
  await withConsoleErrorHiding(() => statusHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}

async function initStatusTestEntities(): Promise<void> {
  const testComponentAtlases = COMPONENT_ATLAS_HANDLERS.map(
    (handler, i): TestComponentAtlas =>
      handler(
        {
          file: {
            atlas: (): TestAtlas => mainAtlas,
            bucket: TEST_S3_BUCKET,
            etag: `atlas-status-component-atlas-${i}-etag`,
            eventTime: new Date().toISOString(),
            fileName: `atlas-status-component-atlas-${i}.h5ad`,
            fileType: FILE_TYPE.INTEGRATED_OBJECT,
            id: deriveTestUuid(BASE_COMPONENT_ATLAS_FILE_ID, i),
            sizeBytes: String((i + 1) * 100),
            versionId: null,
          },
          id: deriveTestUuid(BASE_COMPONENT_ATLAS_ID, i),
          versionId: deriveTestUuid(BASE_COMPONENT_ATLAS_VERSION, i),
        },
        i,
      ),
  );

  const testSourceDatasets = SOURCE_DATASET_HANDLERS.map(
    (handler, i): TestSourceDataset =>
      handler(
        {
          file: {
            atlas: (): TestAtlas => mainAtlas,
            bucket: TEST_S3_BUCKET,
            etag: `atlas-status-source-dataset-${i}-etag`,
            eventTime: new Date().toISOString(),
            fileName: `atlas-status-source-dataset-${i}.h5ad`,
            fileType: FILE_TYPE.SOURCE_DATASET,
            id: deriveTestUuid(BASE_SOURCE_DATASET_FILE_ID, i),
            sizeBytes: String((i + 1) * 100),
            versionId: null,
          },
          id: deriveTestUuid(BASE_SOURCE_DATASET_ID, i),
          versionId: deriveTestUuid(BASE_SOURCE_DATASET_VERSION, i),
        },
        i,
      ),
  );

  const testSourceStudies = SOURCE_STUDIES.map(
    ({ published }, i): TestSourceStudy => {
      const commonFields = {
        cellxgeneCollectionId: null,
        hcaProjectId: null,
        id: deriveTestUuid(BASE_SOURCE_STUDY_ID, i),
      };
      return published
        ? {
            ...commonFields,
            doi: `10.123/atlas-status-${i}`,
            doiStatus: DOI_STATUS.OK,
            publication: {
              authors: [
                { name: `Atlas Status Author ${i}`, personalName: null },
              ],
              hasPreprintDoi: null,
              journal: `Atlas Status Journal ${i}`,
              preprintOfDoi: null,
              publicationDate: new Date().toISOString(),
              title: `Atlas Status ${i}`,
            },
          }
        : {
            ...commonFields,
            unpublishedInfo: {
              contactEmail: `atlas-status-${i}@example.com`,
              referenceAuthor: `Atlas Status Author ${i}`,
              title: `Atlas Status ${i}`,
            },
          };
    },
  );

  const mainAtlas = makeTestAtlas(ATLAS_ID_MAIN, "test atlas status main", {
    componentAtlases: testComponentAtlases.map((c) => c.versionId),
    sourceDatasets: testSourceDatasets.map((d) => d.versionId),
    sourceStudies: testSourceStudies.map((s) => s.id),
  });

  const testAtlases = [
    mainAtlas,
    makeTestAtlas(ATLAS_ID_ENDORSED, "test atlas status endorsed", {
      status: ATLAS_STATUS.OC_ENDORSED,
    }),
    makeTestAtlas(ATLAS_ID_PUBLISHED, "test atlas status published", {
      publishedAt: "2026-06-09T00:12:40.265Z",
    }),
    makeTestAtlas(
      ATLAS_ID_ENDORSED_PUBLISHED,
      "test atlas status published endorsed",
      {
        publishedAt: "2026-06-09T00:12:56.784Z",
        status: ATLAS_STATUS.OC_ENDORSED,
      },
    ),
  ];

  await doTransaction(async (client) => {
    await initUsers(client); // Since the default entities are not otherwise created for these tests, initialize default users here
    await initUsers(client, [INTEGRATION_LEAD]);
    await initSourceStudies(client, testSourceStudies);
    await initFiles(client, {
      componentAtlases: testComponentAtlases,
      sourceDatasets: testSourceDatasets,
    });
    await initSourceDatasets(client, testSourceDatasets);
    await initAtlases(client, testAtlases);
    await initComponentAtlases(client, testComponentAtlases);
  });
}

function makeTestAtlas(
  id: string,
  shortName: string,
  overrides?: Partial<TestAtlas>,
): TestAtlas {
  return {
    cellxgeneAtlasCollection: null,
    codeLinks: [],
    componentAtlases: [],
    description: "",
    generation: 1,
    highlights: "",
    id,
    integrationLead: [INTEGRATION_LEAD],
    network: "eye",
    publications: [],
    revision: 0,
    shortName,
    sourceStudies: [],
    status: ATLAS_STATUS.IN_PROGRESS,
    wave: "1",
    ...overrides,
  };
}

function addValidationResults<T extends TestSourceDataset | TestComponentAtlas>(
  entity: T,
  tools?: Partial<Record<FileValidatorName, boolean>>,
  validationStatus?: FILE_VALIDATION_STATUS,
): T {
  let validationSummary: FileValidationSummary | undefined;
  if (tools) {
    if (validationStatus === undefined)
      validationStatus = FILE_VALIDATION_STATUS.COMPLETED;
    validationSummary = {
      overallValid: true,
      validators: {},
    };
    for (const validator of FILE_VALIDATOR_NAMES) {
      if (tools[validator] !== undefined) {
        if (tools[validator]) {
          validationSummary.validators[validator] = {
            errorCount: 0,
            valid: true,
            warningCount: 0,
          };
        } else {
          validationSummary.validators[validator] = {
            errorCount: 1,
            valid: false,
            warningCount: 0,
          };
          validationSummary.overallValid = false;
        }
      }
    }
  }
  return {
    ...entity,
    file: {
      ...entity.file,
      validationStatus,
      validationSummary,
    },
  };
}

function makeTestSourceDatasetCapUrl(i: number): string {
  return `https://celltype.info/project/${145346 + i}`;
}

function makeTestComponentAtlasCapUrl(i: number): string {
  return `https://celltype.info/project/${652834 + i}`;
}

/**
 * Derive a test UUID from a base ID and an index by performing a bitwise XOR of the two.
 * @param baseId - Base UUID, as a bigint.
 * @param index - Nonnegative index to mark the UUID with.
 * @returns derived UUID as string.
 */
function deriveTestUuid(baseId: bigint, index: number): string {
  return (baseId ^ BigInt(index))
    .toString(16)
    .padStart(32, "0")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}
