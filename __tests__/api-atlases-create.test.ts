import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { NewAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/utils/api-handler";
import createHandler from "../pages/api/atlases/create";
import { USER_CONTENT_ADMIN, USER_NORMAL } from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-app-connect-config");

const NEW_ATLAS_DATA: NewAtlasData = {
  network: "eye",
  shortName: "test",
  version: "1.0",
};

let newAtlasId: string;

afterAll(async () => {
  await query("DELETE FROM hat.atlases WHERE id=$1", [newAtlasId]);
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

  it("returns error 403 for logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doCreateTest(USER_NORMAL, NEW_ATLAS_DATA))._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when network value is not a valid network key", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_ATLAS_DATA,
          network: "notanetwork",
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

  it("creates and returns atlas entry", async () => {
    const newAtlas = (
      await doCreateTest(USER_CONTENT_ADMIN, NEW_ATLAS_DATA)
    )._getJSONData();
    newAtlasId = newAtlas.id;
    expect(newAtlas.overview).toEqual(NEW_ATLAS_DATA);
    const newAtlasFromDb = (
      await query("SELECT * FROM hat.atlases WHERE id=$1", [newAtlas.id])
    ).rows[0];
    expect(newAtlasFromDb.overview).toEqual(NEW_ATLAS_DATA);
    expect(newAtlasFromDb.created_at.toISOString()).toEqual(
      newAtlas.created_at
    );
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
