import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbAtlasToApiAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/create";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { resetDatabase } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

const NEW_ATLAS_DATA: NewAtlasData = {
  integrationLead: null,
  network: "eye",
  shortName: "test",
  version: "1.0",
  wave: "1",
};

const NEW_ATLAS_WITH_IL_DATA: NewAtlasData = {
  integrationLead: {
    email: "foo@example.com",
    name: "Foo",
  },
  network: "eye",
  shortName: "test2",
  version: "1.0",
  wave: "1",
};

const newAtlasIds: string[] = [];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await query("DELETE FROM hat.atlases WHERE id=ANY($1)", [newAtlasIds]);
  endPgPool();
});

describe("/api/atlases/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (await doCreateTest(undefined, NEW_ATLAS_DATA, "GET"))._getStatusCode()
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

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (await doCreateTest(USER_STAKEHOLDER, NEW_ATLAS_DATA))._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when network value is not a valid network key", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_DATA,
          network: "notanetwork" as NewAtlasData["network"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when version is a number rather than a string", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_DATA,
          version: 1 as unknown as NewAtlasData["version"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when wave is is not a valid wave value", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_DATA,
          wave: "0" as NewAtlasData["wave"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead is undefined", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_DATA,
          integrationLead:
            undefined as unknown as NewAtlasData["integrationLead"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead is missing email", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_WITH_IL_DATA,
          integrationLead: {
            name: "Foo",
          } as NewAtlasData["integrationLead"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when integration lead email is not an email address", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_WITH_IL_DATA,
          integrationLead: {
            email: "notanemail",
            name: "Foo",
          },
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns atlas entry with null integration lead", async () => {
    const newAtlas: HCAAtlasTrackerAtlas = (
      await doCreateTest(USER_CONTENT_ADMIN, NEW_ATLAS_DATA)
    )._getJSONData();
    newAtlasIds.push(newAtlas.id);
    const newAtlasFromDb = (
      await query<HCAAtlasTrackerDBAtlas>(
        "SELECT * FROM hat.atlases WHERE id=$1",
        [newAtlas.id]
      )
    ).rows[0];
    expect(newAtlasFromDb.overview).toEqual(NEW_ATLAS_DATA);
    expect(dbAtlasToApiAtlas(newAtlasFromDb)).toEqual(newAtlas);
  });

  it("creates and returns atlas entry with specified integration lead", async () => {
    const newAtlas: HCAAtlasTrackerAtlas = (
      await doCreateTest(USER_CONTENT_ADMIN, NEW_ATLAS_WITH_IL_DATA)
    )._getJSONData();
    newAtlasIds.push(newAtlas.id);
    const newAtlasFromDb = (
      await query<HCAAtlasTrackerDBAtlas>(
        "SELECT * FROM hat.atlases WHERE id=$1",
        [newAtlas.id]
      )
    ).rows[0];
    expect(newAtlasFromDb.overview).toEqual(NEW_ATLAS_WITH_IL_DATA);
    expect(dbAtlasToApiAtlas(newAtlasFromDb)).toEqual(newAtlas);
  });
});

async function doCreateTest(
  user: TestUser | undefined,
  newData: NewAtlasData,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
  });
  await createHandler(req, res);
  return res;
}
