import {
  type HCAAtlasTrackerComponentAtlasSourceDatasetsChanges,
  type HCAAtlasTrackerDBComponentAtlas,
  type HCAAtlasTrackerLocalListSourceDataset,
  type HCAAtlasTrackerSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  type ComponentAtlasAddSourceDatasetsData,
  type ComponentAtlasDeleteSourceDatasetsData,
  type ComponentAtlasSetSourceDatasetsData,
} from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "@/app/common/entities";
import { endPgPool, getPoolClient, query } from "@/app/services/database";
import sourceDatasetsHandler from "@/pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  COMPONENT_ATLAS_ARCHIVED_FOO,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
  COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
  COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  COMPONENT_ATLAS_MISC_BAR,
  COMPONENT_ATLAS_MISC_BAZ,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
  SOURCE_DATASET_ARCHIVED_BAR,
  SOURCE_DATASET_ARCHIVED_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
  SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_FOO,
  SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W1,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_UNREGISTERED,
} from "@/testing/constants";
import {
  expectComponentAtlasToHaveSourceDatasets,
  getComponentAtlasSourceDatasets,
  resetDatabase,
  setComponentAtlasDatasets,
  withRestoredComponentAtlasSourceDatasets,
} from "@/testing/db-utils";
import {
  type TestComponentAtlas,
  type TestSourceDataset,
  type TestUser,
} from "@/testing/entities";
import {
  assertExpectDefined,
  expectApiSourceDatasetsToHaveComponentAtlases,
  expectApiSourceDatasetsToMatchTest,
  getTestEntityDownloadName,
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

const TEST_ROUTE =
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets";

const SOURCE_DATASET_ID_NONEXISTENT = "52281fde-232c-4481-8b45-cc986570e7b9";

const NEW_DATASETS_DATA: ComponentAtlasAddSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_BAR.id],
};

const NEW_DATASETS_DATA_WITH_ARCHIVED: ComponentAtlasAddSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_ARCHIVED_BAR.id],
};

const NEW_DATASETS_WITH_EXISTING_DATA: ComponentAtlasAddSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_BAR.id],
};

const NEW_DATASETS_WITH_NONEXISTENT_DATA: ComponentAtlasAddSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_ID_NONEXISTENT],
  };

const DELETE_DATASETS_DATA: ComponentAtlasDeleteSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_FOOBAR.id],
};

const DELETE_DATASETS_DATA_WITH_ARCHIVED: ComponentAtlasDeleteSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_ARCHIVED_FOO.id],
  };

const DELETE_DATASETS_WITH_MISSING_DATA: ComponentAtlasDeleteSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_FOOBAR.id],
  };

const DELETE_DATASETS_WITH_NONEXISTENT_DATA: ComponentAtlasDeleteSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_ID_NONEXISTENT],
  };

const DELETE_DRAFT_BAR_DATASETS_DATA: ComponentAtlasDeleteSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id],
};

const SET_DATASETS_DATA: ComponentAtlasSetSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_BAR.id],
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for PATCH request", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.file.id,
          undefined,
          METHOD.PATCH,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when source datasets are requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.GET,
          undefined,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when source datasets are requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.GET,
          undefined,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when source datasets are requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source datasets that are also linked to the atlas",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDatasets =
          res._getJSONData() as HCAAtlasTrackerSourceDataset[];
        expectApiSourceDatasetsToMatchTest(sourceDatasets, [
          SOURCE_DATASET_FOOFOO,
          SOURCE_DATASET_FOOBAR,
        ]);
      },
    );
  }

  it("returns source datasets that are also linked to the atlas when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_FOOFOO,
      SOURCE_DATASET_FOOBAR,
    ]);
  });

  it("returns only non-archived source datasets when requested from non-archived component atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
    ]);
  });

  it("returns only non-archived source datasets when requested from archived component atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ARCHIVED_FOO.id,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
    ]);
  });

  it("returns source datasets when requested from non-latest component atlas linked to the atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
    ]);
  });

  it("returns source datasets including non-latest version linked to the component atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    ]);
  });

  it("returns component atlas lists", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      COMPONENT_ATLAS_MISC_BAR.id,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets =
      res._getJSONData() as HCAAtlasTrackerLocalListSourceDataset[];
    expectApiSourceDatasetsToHaveComponentAtlases(sourceDatasets, [
      {
        componentAtlases: [COMPONENT_ATLAS_MISC_FOO, COMPONENT_ATLAS_MISC_BAR],
        sourceDataset: SOURCE_DATASET_FOO,
      },
      {
        componentAtlases: [COMPONENT_ATLAS_MISC_BAR],
        sourceDataset: SOURCE_DATASET_BAR,
      },
      {
        componentAtlases: [
          COMPONENT_ATLAS_MISC_FOO,
          COMPONENT_ATLAS_MISC_BAR,
          COMPONENT_ATLAS_MISC_BAZ,
        ],
        sourceDataset: SOURCE_DATASET_FOOFOO,
      },
    ]);
  });

  it("does not include archived component atlas in component atlas list", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets =
      res._getJSONData() as HCAAtlasTrackerLocalListSourceDataset[];
    const sourceDatasetMultipleFiles = sourceDatasets.find(
      (d) => d.id === SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
    );
    assertExpectDefined(sourceDatasetMultipleFiles);
    expect(sourceDatasetMultipleFiles.componentAtlases).toEqual([
      {
        id: COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
        name: getTestEntityDownloadName(COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3),
      },
    ]);
  });

  it("returns component atlas list for source dataset linked to only a non-latest component atlas version", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
      USER_CONTENT_ADMIN,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets =
      res._getJSONData() as HCAAtlasTrackerLocalListSourceDataset[];
    const sourceDatasetBaz = sourceDatasets.find(
      (d) => d.id === SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
    );
    assertExpectDefined(sourceDatasetBaz);
    expect(sourceDatasetBaz.componentAtlases).toEqual([
      {
        id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
        name: getTestEntityDownloadName(
          COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
        ),
      },
    ]);
  });

  it("returns error 401 when POST requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      NEW_DATASETS_DATA,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      },
    );
  }

  it("returns error 403 when POST requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.POST,
          NEW_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when POST requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested from component atlas that already has one of the source datasets", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_EXISTING_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 for POST requested where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_NONEXISTENT_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested from archived component atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ARCHIVED_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      NEW_DATASETS_DATA_WITH_ARCHIVED,
      true,
    );
    expect(res._getStatusCode()).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);
  });

  it("returns error 400 when POST requested from component atlas with non-latest version linked to the atlas", async () => {
    const newDatasetsData = {
      sourceDatasetIds: [SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR],
    } satisfies ComponentAtlasAddSourceDatasetsData;
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      newDatasetsData,
      true,
    );
    expect(res._getStatusCode()).toEqual(400);
    expect(res._getData()).toContain("latest version");
    await expectComponentAtlasToBeUnchanged(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
    );
  });

  it("adds source datasets when POST requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_BAR,
    );

    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_BAR.id,
      USER_INTEGRATION_LEAD_DRAFT,
      METHOD.POST,
      NEW_DATASETS_DATA,
    );
    expect(res._getStatusCode()).toEqual(201);
    await expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_BAR, [
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
      SOURCE_DATASET_FOO,
      SOURCE_DATASET_BAR,
    ]);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_DRAFT_BAR,
      sourceDatasetsBefore,
    );
  });

  it("adds source datasets when POST requested by user with CONTENT_ADMIN role", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
    );

    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      NEW_DATASETS_DATA,
    );
    expect(res._getStatusCode()).toEqual(201);
    await expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOFOO,
      SOURCE_DATASET_FOOBAR,
      SOURCE_DATASET_FOOBAZ,
      SOURCE_DATASET_FOO,
      SOURCE_DATASET_BAR,
    ]);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      sourceDatasetsBefore,
    );
  });

  it("adds source datasets when POST requested with archived source dataset for non-archived component atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
    );

    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      NEW_DATASETS_DATA_WITH_ARCHIVED,
    );
    expect(res._getStatusCode()).toEqual(201);
    await expectComponentAtlasToHaveSourceDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
      [
        SOURCE_DATASET_ARCHIVED_FOO,
        SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
        SOURCE_DATASET_ARCHIVED_BAR,
      ],
    );
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
      sourceDatasetsBefore,
    );
  });

  it("adds source datasets when POST requested with non-latest source dataset linked to the atlas", async () => {
    const newDatasetsData: ComponentAtlasAddSourceDatasetsData = {
      sourceDatasetIds: [
        SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
        SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_FOO,
      ],
    };

    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    );

    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      newDatasetsData,
    );
    expect(res._getStatusCode()).toEqual(201);
    await expectComponentAtlasToHaveSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
      [
        SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
        SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
        SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
      ],
    );
    await expectComponentAtlasToBeUnchanged(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W1,
    );

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
      sourceDatasetsBefore,
    );
  });

  it("returns error 401 when DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.DELETE,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      DELETE_DATASETS_DATA,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      },
    );
  }

  it("returns error 403 when DELETE requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when DELETE requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested from component atlas that one of the source datasets doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_MISSING_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 for DELETE request where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_NONEXISTENT_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested from archived component atlas", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          COMPONENT_ATLAS_ARCHIVED_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA_WITH_ARCHIVED,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_ARCHIVED_FOO);
  });

  it("returns error 400 when DELETE requested from component atlas with non-latest version linked to the atlas", async () => {
    const deleteDatasetsData = {
      sourceDatasetIds: [SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_FOO],
    } satisfies ComponentAtlasDeleteSourceDatasetsData;
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
      USER_CONTENT_ADMIN,
      METHOD.DELETE,
      deleteDatasetsData,
      true,
    );
    expect(res._getStatusCode()).toEqual(400);
    expect(res._getData()).toContain("latest version");
    await expectComponentAtlasToBeUnchanged(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
    );
  });

  it("deletes source datasets when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_BAR,
    );

    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_BAR.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE,
          DELETE_DRAFT_BAR_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(200);
    await expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_BAR, [
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
    ]);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_DRAFT_BAR,
      sourceDatasetsBefore,
    );
  });

  it("deletes source datasets when requested by user with CONTENT_ADMIN role", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
    );

    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(200);
    await expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOBAZ,
    ]);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      sourceDatasetsBefore,
    );
  });

  it("deletes source datasets when requested with archived source dataset for non-archived component atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
    );

    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA_WITH_ARCHIVED,
        )
      )._getStatusCode(),
    ).toEqual(200);
    await expectComponentAtlasToHaveSourceDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
      [SOURCE_DATASET_WITH_MULTIPLE_FILES_W3],
    );
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_MISC_FOO);

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
      sourceDatasetsBefore,
    );
  });

  it("deletes source datasets when requested with non-latest source dataset linked to the atlas", async () => {
    const deleteDatasetsData: ComponentAtlasDeleteSourceDatasetsData = {
      sourceDatasetIds: [SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR],
    };

    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    );

    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
          COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          deleteDatasetsData,
        )
      )._getStatusCode(),
    ).toEqual(200);
    await expectComponentAtlasToHaveSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
      [],
    );
    await expectComponentAtlasToBeUnchanged(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W1,
    );

    await setComponentAtlasDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
      sourceDatasetsBefore,
    );
  });

  it("returns error 401 when PUT requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.PUT,
          SET_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 403 when PUT requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.PUT,
          SET_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 403 when PUT requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PUT,
          SET_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.PUT,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      SET_DATASETS_DATA,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectDraftFooSourceDatasetsToBeUnchanged();
      },
    );
  }

  it("returns error 403 when PUT requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PUT,
          SET_DATASETS_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 404 when PUT requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          SET_DATASETS_DATA,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 404 when PUT requested with a source dataset from another atlas", async () => {
    const setDatasetsData: ComponentAtlasSetSourceDatasetsData = {
      sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_FOOBAZ.id],
    };
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      setDatasetsData,
      true,
    );
    expect(res._getStatusCode()).toEqual(404);
    expect(res._getData()).toContain(SOURCE_DATASET_FOOBAZ.id);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 404 when PUT requested with a source dataset that doesn't exist", async () => {
    const setDatasetsData: ComponentAtlasSetSourceDatasetsData = {
      sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_ID_NONEXISTENT],
    };
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          setDatasetsData,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 400 when PUT requested without source dataset IDs", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {},
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("returns error 400 when PUT requested from archived component atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_ARCHIVED_FOO,
    );
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          COMPONENT_ATLAS_ARCHIVED_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          { sourceDatasetIds: [] },
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    expect(
      await getComponentAtlasSourceDatasets(COMPONENT_ATLAS_ARCHIVED_FOO),
    ).toEqual(sourceDatasetsBefore);
  });

  it("returns error 400 when PUT requested from component atlas with non-latest version linked to the atlas", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
    );
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      { sourceDatasetIds: [] },
      true,
    );
    expect(res._getStatusCode()).toEqual(400);
    expect(res._getData()).toContain("latest version");
    expect(
      await getComponentAtlasSourceDatasets(
        COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
      ),
    ).toEqual(sourceDatasetsBefore);
  });

  it("only adds source datasets when PUT requested with a superset of the linked source datasets", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      async () => {
        const res = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            sourceDatasetIds: [
              SOURCE_DATASET_FOOFOO.id,
              SOURCE_DATASET_FOOBAR.id,
              SOURCE_DATASET_FOO.id,
            ],
          },
        );
        expectSetResponse(res, [SOURCE_DATASET_FOO], []);
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [
            SOURCE_DATASET_FOOFOO,
            SOURCE_DATASET_FOOBAR,
            SOURCE_DATASET_FOOBAZ,
            SOURCE_DATASET_FOO,
          ],
        );
      },
    );
  });

  it("only removes source datasets when PUT requested with a subset of the linked source datasets", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      async () => {
        const res = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          { sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id] },
        );
        expectSetResponse(res, [], [SOURCE_DATASET_FOOBAR]);
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [SOURCE_DATASET_FOOFOO, SOURCE_DATASET_FOOBAZ],
        );
      },
    );
  });

  it("adds and removes source datasets when PUT requested by user with INTEGRATION_LEAD role for the atlas, and changes nothing when repeated", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      async () => {
        const res = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.PUT,
          SET_DATASETS_DATA,
        );
        expectSetResponse(res, [SOURCE_DATASET_BAR], [SOURCE_DATASET_FOOBAR]);
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [SOURCE_DATASET_FOOFOO, SOURCE_DATASET_FOOBAZ, SOURCE_DATASET_BAR],
        );
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_BAR,
          COMPONENT_ATLAS_DRAFT_BAR.sourceDatasets,
        );

        const repeatRes = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.PUT,
          SET_DATASETS_DATA,
        );
        expectSetResponse(repeatRes, [], []);
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [SOURCE_DATASET_FOOFOO, SOURCE_DATASET_FOOBAZ, SOURCE_DATASET_BAR],
        );
      },
    );
  });

  it("changes nothing when PUT requested with the linked source datasets", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      {
        sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_FOOBAR.id],
      },
    );
    expectSetResponse(res, [], []);
    await expectDraftFooSourceDatasetsToBeUnchanged();
  });

  it("removes all source datasets linked to the atlas, and keeps others, when PUT requested with an empty list", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      async () => {
        const res = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          { sourceDatasetIds: [] },
        );
        expectSetResponse(
          res,
          [],
          [SOURCE_DATASET_FOOFOO, SOURCE_DATASET_FOOBAR],
        );
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [SOURCE_DATASET_FOOBAZ],
        );
      },
    );
  });

  it("ignores duplicate IDs when PUT requested", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO,
      async () => {
        const res = await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            sourceDatasetIds: [
              SOURCE_DATASET_FOO.id,
              SOURCE_DATASET_FOOFOO.id,
              SOURCE_DATASET_FOO.id,
              SOURCE_DATASET_FOOFOO.id,
            ],
          },
        );
        expectSetResponse(res, [SOURCE_DATASET_FOO], [SOURCE_DATASET_FOOBAR]);
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_DRAFT_FOO,
          [SOURCE_DATASET_FOOFOO, SOURCE_DATASET_FOOBAZ, SOURCE_DATASET_FOO],
        );
      },
    );
  });

  for (const method of [METHOD.POST, METHOD.PUT]) {
    it(`waits for a concurrent change to the atlas before resolving source dataset versions when ${method} requested`, async () => {
      await withRestoredComponentAtlasSourceDatasets(
        COMPONENT_ATLAS_DRAFT_FOO,
        async () => {
          // Stand in for an S3 upload replacing a source dataset version on the atlas.
          const client = await getPoolClient();
          let settled = false;
          let resPromise:
            | Promise<httpMocks.MockResponse<NextApiResponse>>
            | undefined;
          try {
            await client.query("BEGIN");
            await client.query(
              "SELECT id FROM hat.atlases WHERE id=$1 FOR UPDATE",
              [ATLAS_DRAFT.id],
            );
            resPromise = doSourceDatasetsRequest(
              ATLAS_DRAFT.id,
              COMPONENT_ATLAS_DRAFT_FOO.id,
              USER_CONTENT_ADMIN,
              method,
              { sourceDatasetIds: [SOURCE_DATASET_FOO.id] },
            ).finally(() => (settled = true));
            await new Promise((resolve) => setTimeout(resolve, 500));
            expect(settled).toBe(false);
          } finally {
            await client.query("ROLLBACK");
            client.release();
          }
          const res = await resPromise;
          expect(res?._getStatusCode()).toEqual(
            method === METHOD.POST ? 201 : 200,
          );
        },
      );
    });
  }

  it("adds the atlas's version alongside a different linked version of the same source dataset when PUT requested", async () => {
    await withRestoredComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
      async () => {
        await setComponentAtlasDatasets(
          COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
          [SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W1.versionId],
        );
        const res = await doSourceDatasetsRequest(
          ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
          COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            sourceDatasetIds: [
              SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
            ],
          },
        );
        expectSetResponse(
          res,
          [SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2],
          [],
        );
        await expectComponentAtlasToHaveSourceDatasets(
          COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
          [
            SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W1,
            SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
          ],
        );
      },
    );
  });
});

async function expectDraftFooSourceDatasetsToBeUnchanged(): Promise<void> {
  await expectComponentAtlasToHaveSourceDatasets(
    COMPONENT_ATLAS_DRAFT_FOO,
    COMPONENT_ATLAS_DRAFT_FOO.sourceDatasets,
  );
}

function expectSetResponse(
  res: httpMocks.MockResponse<NextApiResponse>,
  expectedAdded: TestSourceDataset[],
  expectedRemoved: TestSourceDataset[],
): void {
  expect(res._getStatusCode()).toEqual(200);
  const { added, removed } =
    res._getJSONData() as HCAAtlasTrackerComponentAtlasSourceDatasetsChanges;
  expect([...added].sort()).toEqual(expectedAdded.map(({ id }) => id).sort());
  expect([...removed].sort()).toEqual(
    expectedRemoved.map(({ id }) => id).sort(),
  );
}

async function doSourceDatasetsRequest(
  atlasId: string,
  componentAtlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  body?: Record<string, unknown>,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { cookie: user?.cookie },
    method,
    query: getQueryValues(atlasId, componentAtlasId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetsHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  componentAtlasId: string,
): Record<string, string> {
  return { atlasId, componentAtlasId };
}

async function expectComponentAtlasToBeUnchanged(
  componentAtlas: TestComponentAtlas,
): Promise<void> {
  const componentAtlasFromDb = await getComponentAtlasFromDatabase(
    componentAtlas.id,
  );
  expect(componentAtlasFromDb).toBeDefined();
  if (!componentAtlasFromDb) return;
  expect(componentAtlasFromDb.component_info.capUrl).toEqual(
    componentAtlas.capUrl ?? null,
  );
}

async function getComponentAtlasFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBComponentAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [id],
    )
  ).rows[0];
}
