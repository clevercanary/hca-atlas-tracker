import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/create";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const NEW_ATLAS_DATA: NewAtlasData = {
  description: "foo bar baz baz foo bar",
  integrationLead: [],
  network: "eye",
  shortName: "test",
  version: "1.0",
  wave: "1",
};

const NEW_ATLAS_WITH_IL_DATA: NewAtlasData = {
  description: "bar foo baz foo bar baz bar",
  integrationLead: [
    {
      email: "foo@example.com",
      name: "Foo",
    },
  ],
  network: "eye",
  shortName: "test2",
  version: "1.0",
  wave: "1",
};

const NEW_ATLAS_WITH_MULTIPLE_ILS: NewAtlasData = {
  description: "foo baz foo foo",
  integrationLead: [
    {
      email: "foofoo@example.com",
      name: "Foo Foo",
    },
    {
      email: "foobar@example.com",
      name: "Foo Bar",
    },
    {
      email: "foobaz@example.com",
      name: "Foo Baz",
    },
  ],
  network: "development",
  shortName: "test3",
  version: "1.2",
  wave: "3",
};

const NEW_ATLAS_WITH_TARGET_COMPLETION: NewAtlasData = {
  description: "bar bar foo foo foo bar",
  integrationLead: [],
  network: "musculoskeletal",
  shortName: "test4",
  targetCompletion: "2024-06-03T21:07:22.177Z",
  version: "3.3",
  wave: "2",
};

const NEW_ATLAS_WITHOUT_DESCRIPTION: NewAtlasData = {
  integrationLead: [],
  network: "nervous-system",
  shortName: "test5",
  version: "5.3",
  wave: "2",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(undefined, NEW_ATLAS_DATA, false, "GET")
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doCreateTest(undefined, NEW_ATLAS_DATA))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (await doCreateTest(USER_UNREGISTERED, NEW_ATLAS_DATA))._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      "/api/atlases/create",
      createHandler,
      METHOD.POST,
      role,
      undefined,
      NEW_ATLAS_DATA,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("returns error 400 when network value is not a valid network key", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            network: "notanetwork" as NewAtlasData["network"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when version is a number rather than a string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            version: 1 as unknown as NewAtlasData["version"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when wave is is not a valid wave value", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            wave: "0" as NewAtlasData["wave"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead is undefined", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            integrationLead:
              undefined as unknown as NewAtlasData["integrationLead"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead is missing email", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_WITH_IL_DATA,
            integrationLead: [
              {
                name: "Foo",
              },
            ] as NewAtlasData["integrationLead"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead email is not an email address", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_WITH_IL_DATA,
            integrationLead: [
              {
                email: "notanemail",
                name: "Foo",
              },
            ],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when target completion is non-UTC", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_WITH_TARGET_COMPLETION,
            targetCompletion: "2024-06-03T14:07:22.177-0700",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when description is too long", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_WITH_TARGET_COMPLETION,
            description: "x".repeat(10001),
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns atlas entry with no integration leads", async () => {
    await testSuccessfulCreate(NEW_ATLAS_DATA);
  });

  it("creates and returns atlas entry with specified integration lead", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_IL_DATA);
  });

  it("creates and returns atlas entry with multiple integration leads", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_MULTIPLE_ILS);
  });

  it("creates and returns atlas entry with target completion", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_TARGET_COMPLETION);
  });

  it("creates and returns atlas entry without description", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITHOUT_DESCRIPTION);
  });
});

async function testSuccessfulCreate(atlasData: NewAtlasData): Promise<void> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlasData);
  expect(res._getStatusCode()).toEqual(201);
  const newAtlas: HCAAtlasTrackerAtlas = res._getJSONData();
  const newAtlasFromDb = await getAtlasFromDb(newAtlas.id);
  expect(newAtlasFromDb.source_studies).toEqual([]);
  expect(newAtlasFromDb.status).toEqual(ATLAS_STATUS.DRAFT);
  expect(newAtlasFromDb.target_completion).toEqual(
    atlasData.targetCompletion ? new Date(atlasData.targetCompletion) : null
  );
  expect(newAtlasFromDb.overview.description).toEqual(
    atlasData.description ?? ""
  );
  expect(newAtlasFromDb.overview.integrationLead).toEqual(
    atlasData.integrationLead
  );
  expect(newAtlasFromDb.overview.network).toEqual(atlasData.network);
  expect(newAtlasFromDb.overview.shortName).toEqual(atlasData.shortName);
  expect(newAtlasFromDb.overview.version).toEqual(atlasData.version);
  expect(newAtlasFromDb.overview.wave).toEqual(atlasData.wave);
  expect(newAtlasFromDb.overview.taskCount).toEqual(0);
  expect(newAtlasFromDb.overview.completedTaskCount).toEqual(0);
  expectAtlasPropertiesToMatch(newAtlasFromDb, newAtlas);
}

function expectAtlasPropertiesToMatch(
  dbAtlas: HCAAtlasTrackerDBAtlas,
  apiAtlas: HCAAtlasTrackerAtlas
): void {
  expect(dbAtlas.overview.network).toEqual(apiAtlas.bioNetwork);
  expect(dbAtlas.overview.completedTaskCount).toEqual(
    apiAtlas.completedTaskCount
  );
  expect(dbAtlas.id).toEqual(apiAtlas.id);
  expect(dbAtlas.overview.integrationLead).toEqual(apiAtlas.integrationLead);
  expect(dbAtlas.overview.shortName).toEqual(apiAtlas.shortName);
  expect(dbAtlas.source_studies).toHaveLength(apiAtlas.sourceStudyCount);
  expect(dbAtlas.status).toEqual(apiAtlas.status);
  expect(dbAtlas.target_completion?.toISOString() ?? null).toEqual(
    apiAtlas.targetCompletion
  );
  expect(dbAtlas.overview.taskCount).toEqual(apiAtlas.taskCount);
  expect(dbAtlas.overview.version).toEqual(apiAtlas.version);
  expect(dbAtlas.overview.wave).toEqual(apiAtlas.wave);
}

async function doCreateTest(
  user: TestUser | undefined,
  newData: NewAtlasData,
  hideConsoleError = false,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

async function getAtlasFromDb(id: string): Promise<HCAAtlasTrackerDBAtlas> {
  return (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id]
    )
  ).rows[0];
}
