import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import publishHandler from "../pages/api/atlases/[atlasId]/publish";
import {
  ATLAS_WITH_LINKED_PUBLISH_STATUSES,
  ATLAS_PUBLISHED,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
  SOURCE_DATASET_PUBLISH_STATUSES_PUBLISHED_FOO,
  SOURCE_DATASET_PUBLISH_STATUSES_PUBLISHED_BAR,
  SOURCE_DATASET_PUBLISH_STATUSES_UNPUBLISHED_FOO,
  SOURCE_DATASET_PUBLISH_STATUSES_UNPUBLISHED_BAR,
  COMPONENT_ATLAS_PUBLISH_STATUSES_UNPUBLISHED_FOO,
  COMPONENT_ATLAS_PUBLISH_STATUSES_UNPUBLISHED_BAR,
  COMPONENT_ATLAS_PUBLISH_STATUSES_PUBLISHED_FOO,
  COMPONENT_ATLAS_PUBLISH_STATUSES_PUBLISHED_BAR,
} from "../testing/constants";
import {
  getExistingAtlasFromDatabase,
  getExistingComponentAtlasFromDatabase,
  getExistingSourceDatasetFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import {
  TestComponentAtlas,
  TestSourceDataset,
  TestUser,
} from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("googleapis");
jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[id]/publish";

const ATLAS_ID_NONEXISTENT = "f643a5ff-0803-4bf1-b650-184161220bc2";

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
        await doPublishRequest(
          ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
          USER_CONTENT_ADMIN,
          false,
          METHOD.PUT,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when requested by logged out user", async () => {
    expect(
      (
        await doPublishRequest(
          ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
          undefined,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when requested by unregistered user", async () => {
    expect(
      (
        await doPublishRequest(
          ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
          USER_UNREGISTERED,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when requested by disabled user", async () => {
    expect(
      (
        await doPublishRequest(
          ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
          USER_DISABLED_CONTENT_ADMIN,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      publishHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_WITH_LINKED_PUBLISH_STATUSES.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      },
    );
  }

  it("returns error 404 when nonexistent atlas is requested", async () => {
    expect(
      (
        await doPublishRequest(ATLAS_ID_NONEXISTENT, USER_CONTENT_ADMIN, true)
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 400 when already-published atlas is requested", async () => {
    expect(
      (
        await doPublishRequest(ATLAS_PUBLISHED.id, USER_CONTENT_ADMIN, true)
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 when already-published atlas is requested", async () => {
    expect(
      (
        await doPublishRequest(ATLAS_PUBLISHED.id, USER_CONTENT_ADMIN, true)
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("publishes unpublished atlas and linked unpublished metadata entities when requested by content admin", async () => {
    expect(
      (
        await doPublishRequest(
          ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
          USER_CONTENT_ADMIN,
        )
      )._getStatusCode(),
    ).toEqual(200);

    // Check that atlas is published
    const atlas = await getExistingAtlasFromDatabase(
      ATLAS_WITH_LINKED_PUBLISH_STATUSES.id,
    );
    expect(atlas.published_at).not.toBeNull();
    // Make sure that version numbers have not changed
    expect(atlas.generation).toEqual(
      ATLAS_WITH_LINKED_PUBLISH_STATUSES.generation,
    );
    expect(atlas.revision).toEqual(ATLAS_WITH_LINKED_PUBLISH_STATUSES.revision);

    // Check linked component atlases
    await expectMetadataEntityPublishResult(
      COMPONENT_ATLAS_PUBLISH_STATUSES_UNPUBLISHED_FOO,
      getExistingComponentAtlasFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      COMPONENT_ATLAS_PUBLISH_STATUSES_UNPUBLISHED_BAR,
      getExistingComponentAtlasFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      COMPONENT_ATLAS_PUBLISH_STATUSES_PUBLISHED_FOO,
      getExistingComponentAtlasFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      COMPONENT_ATLAS_PUBLISH_STATUSES_PUBLISHED_BAR,
      getExistingComponentAtlasFromDatabase,
    );

    // Check linked source datasets
    await expectMetadataEntityPublishResult(
      SOURCE_DATASET_PUBLISH_STATUSES_UNPUBLISHED_FOO,
      getExistingSourceDatasetFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      SOURCE_DATASET_PUBLISH_STATUSES_UNPUBLISHED_BAR,
      getExistingSourceDatasetFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      SOURCE_DATASET_PUBLISH_STATUSES_PUBLISHED_FOO,
      getExistingSourceDatasetFromDatabase,
    );
    await expectMetadataEntityPublishResult(
      SOURCE_DATASET_PUBLISH_STATUSES_PUBLISHED_BAR,
      getExistingSourceDatasetFromDatabase,
    );
  });
});

async function expectMetadataEntityPublishResult(
  testEntity: TestComponentAtlas | TestSourceDataset,
  getDbEntity: (
    versionId: string,
  ) => Promise<
    HCAAtlasTrackerDBComponentAtlas | HCAAtlasTrackerDBSourceDataset
  >,
): Promise<void> {
  const dbEntity = await getDbEntity(testEntity.versionId);
  expect(dbEntity.published_at).not.toBeNull();

  const { revision: initRevision = 1, wipNumber: initWipNumber = 1 } =
    testEntity;

  expect(dbEntity.revision).toEqual(initRevision);
  expect(dbEntity.wip_number).toEqual(initWipNumber);
}

async function doPublishRequest(
  atlasId: string,
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.POST,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => publishHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
