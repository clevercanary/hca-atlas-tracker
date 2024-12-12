import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { getSourceDataset } from "../app/services/source-datasets";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_PUBLIC,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOFOO,
  SOURCE_STUDY_PUBLIC_WITH_JOURNAL,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  getExistingComponentAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestSourceDataset, TestUser } from "../testing/entities";
import {
  makeTestSourceDatasetInfo,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE =
  "/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/[sourceDatasetId]";

const SOURCE_DATASET_FOO_EDIT: SourceDatasetEditData = {
  title: "Source Dataset Foo Edited",
};

const SOURCE_DATASET_BAR_EDIT: SourceDatasetEditData = {
  title: "Source Dataset Bar Edited",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source dataset is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when source dataset is GET requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_UNREGISTERED
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when source dataset is GET requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when source dataset is GET requested by user with CONTENT_ADMIN role via atlas it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 404 when source dataset is GET requested by user with CONTENT_ADMIN role via source study it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source dataset",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.GET,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
        SOURCE_DATASET_FOO.id
      ),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDataset =
          res._getJSONData() as HCAAtlasTrackerSourceDataset;
        expect(sourceDataset.title).toEqual(SOURCE_DATASET_FOO.title);
      }
    );
  }

  it("returns source dataset from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      SOURCE_DATASET_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.title).toEqual(SOURCE_DATASET_FOO.title);
  });

  it("returns CELLxGENE source dataset when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.title).toEqual(
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.title
    );
  });

  it("returns error 401 when source dataset is PATCH requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 403 when source dataset is PATCH requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_STAKEHOLDER,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 403 when source dataset is PATCH requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.PATCH,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
        SOURCE_DATASET_FOO.id
      ),
      SOURCE_DATASET_FOO_EDIT,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
      }
    );
  }

  it("returns error 403 when source dataset is PATCH requested from draft atlas by logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 404 when source dataset is PATCH requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 404 when source dataset is PATCH requested from source study it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 400 for source dataset PATCH requested with title set to undefined", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          {
            ...SOURCE_DATASET_FOO_EDIT,
            title: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 400 when CELLxGENE dataset is PATCH requested", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          SOURCE_DATASET_FOO_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
  });

  it("updates and returns source dataset when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      SOURCE_DATASET_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      SOURCE_DATASET_FOO_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedSourceDataset = res._getJSONData();
    const sourceDatasetFromDb = await getSourceDataset(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      updatedSourceDataset.id
    );
    expect(sourceDatasetFromDb).toBeDefined();
    if (!sourceDatasetFromDb) return;
    expect(sourceDatasetFromDb.sd_info.title).toEqual(
      SOURCE_DATASET_FOO_EDIT.title
    );
    expect(dbSourceDatasetToApiSourceDataset(sourceDatasetFromDb)).toEqual(
      updatedSourceDataset
    );

    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_BAR);

    await restoreDbSourceDataset(SOURCE_DATASET_FOO);
  });

  it("updates and returns source dataset when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      SOURCE_DATASET_BAR.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      SOURCE_DATASET_BAR_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedSourceDataset = res._getJSONData();
    const sourceDatasetFromDb = await getSourceDataset(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      updatedSourceDataset.id
    );
    expect(sourceDatasetFromDb).toBeDefined();
    if (!sourceDatasetFromDb) return;
    expect(sourceDatasetFromDb.sd_info.title).toEqual(
      SOURCE_DATASET_BAR_EDIT.title
    );
    expect(dbSourceDatasetToApiSourceDataset(sourceDatasetFromDb)).toEqual(
      updatedSourceDataset
    );

    await restoreDbSourceDataset(SOURCE_DATASET_BAR);
  });

  it("returns error 401 when source dataset is DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 403 when source dataset is DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 403 when source dataset is DELETE requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.DELETE,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
        SOURCE_DATASET_FOO.id
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
      }
    );
  }

  it("returns error 403 when source dataset is DELETE requested from draft atlas by logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 404 when source dataset is DELETE requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 404 when source dataset is DELETE requested from source study it doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 400 when CELLxGENE source dataset is DELETE requested", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
          SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
  });

  it("returns error 400 when source dataset with linked atlas is DELETE requested", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
          SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });

  it("deletes source dataset when requested by user with CONTENT_ADMIN role", async () => {
    const caDraftFooBefore = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );
    expect(caDraftFooBefore.source_datasets).toContain(
      SOURCE_DATASET_FOOFOO.id
    );

    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getSourceDatasetFromDatabase(SOURCE_DATASET_FOOFOO.id)
    ).toBeUndefined();

    const caDraftFooAfter = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );
    expect(caDraftFooAfter.source_datasets).not.toContain(
      SOURCE_DATASET_FOOFOO.id
    );

    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_BAR);

    await query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id) VALUES ($1, $2, $3)",
      [
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
        JSON.stringify(makeTestSourceDatasetInfo(SOURCE_DATASET_FOOFOO)),
        SOURCE_DATASET_FOOFOO.id,
      ]
    );
  });

  it("deletes source dataset when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          SOURCE_DATASET_FOOBAR.id,
          USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getSourceDatasetFromDatabase(SOURCE_DATASET_FOOBAR.id)
    ).toBeUndefined();

    await query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id) VALUES ($1, $2, $3)",
      [
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
        JSON.stringify(makeTestSourceDatasetInfo(SOURCE_DATASET_FOOBAR)),
        SOURCE_DATASET_FOOBAR.id,
      ]
    );
  });
});

async function doSourceDatasetRequest(
  atlasId: string,
  sourceStudyId: string,
  sourceDatasetId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceStudyId, sourceDatasetId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceStudyId: string,
  sourceDatasetId: string
): Record<string, string> {
  return { atlasId, sourceDatasetId, sourceStudyId };
}

async function restoreDbSourceDataset(
  sourceDataset: TestSourceDataset
): Promise<void> {
  await query("UPDATE hat.source_datasets SET sd_info=$1 WHERE id=$2", [
    JSON.stringify({
      cellCount: 0,
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
      title: sourceDataset.title,
    }),
    sourceDataset.id,
  ]);
}

async function expectSourceDatasetToBeUnchanged(
  sourceDataset: TestSourceDataset
): Promise<void> {
  const sourceDatasetFromDb = await getSourceDatasetFromDatabase(
    sourceDataset.id
  );
  expect(sourceDatasetFromDb).toBeDefined();
  if (!sourceDatasetFromDb) return;
  expect(sourceDatasetFromDb.source_study_id).toEqual(
    sourceDataset.sourceStudyId
  );
  expect(sourceDatasetFromDb.sd_info.title).toEqual(sourceDataset.title);
}

async function getSourceDatasetFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceDataset | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
      [id]
    )
  ).rows[0];
}
