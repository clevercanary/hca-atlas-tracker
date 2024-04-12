import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/utils/api-handler";
import atlasHandler from "../pages/api/atlases/[atlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { makeTestAtlasOverview } from "../testing/utils";

jest.mock("../app/utils/pg-app-connect-config");

const ATLAS_PUBLIC_EDIT: AtlasEditData = {
  integrationLead: {
    email: "bar@example.com",
    name: "Bar",
  },
  network: ATLAS_PUBLIC.network,
  shortName: "test-public-edited",
  version: "2.0",
  wave: "2",
};

const ATLAS_WITH_IL_EDIT: AtlasEditData = {
  integrationLead: null,
  network: "development",
  shortName: ATLAS_WITH_IL.shortName,
  version: "2.1",
  wave: ATLAS_WITH_IL.wave,
};

afterAll(async () => {
  await query("UPDATE hat.atlases SET overview=$1 WHERE id=$2", [
    JSON.stringify(makeTestAtlasOverview(ATLAS_PUBLIC)),
    ATLAS_PUBLIC.id,
  ]);
  await query("UPDATE hat.atlases SET overview=$1 WHERE id=$2", [
    JSON.stringify(makeTestAtlasOverview(ATLAS_WITH_IL)),
    ATLAS_WITH_IL.id,
  ]);
  endPgPool();
});

describe("/api/atlases/[id]", () => {
  it("returns error 405 for non-GET, non-PUT request", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, undefined, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns public atlas when GET requested by logged out user", async () => {
    const res = await doAtlasRequest(ATLAS_PUBLIC.id);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.shortName).toEqual(ATLAS_PUBLIC.shortName);
  });

  it("returns public atlas when GET requested by logged in user without CONTENT_ADMIN role", async () => {
    const res = await doAtlasRequest(ATLAS_PUBLIC.id, USER_NORMAL);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.shortName).toEqual(ATLAS_PUBLIC.shortName);
  });

  it("returns error 404 when draft atlas is GET requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_DRAFT.id))._getStatusCode()).toEqual(
      404
    );
  });

  it("returns error 404 when draft atlas is GET requested by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doAtlasRequest(ATLAS_DRAFT.id, USER_NORMAL))._getStatusCode()
    ).toEqual(404);
  });

  it("returns draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doAtlasRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.bioNetwork).toEqual(ATLAS_DRAFT.network);
    expect(atlas.id).toEqual(ATLAS_DRAFT.id);
    expect(atlas.integrationLead).toEqual(ATLAS_DRAFT.integrationLead);
    expect(atlas.shortName).toEqual(ATLAS_DRAFT.shortName);
    expect(atlas.sourceDatasetCount).toEqual(ATLAS_DRAFT.sourceDatasets.length);
    expect(atlas.status).toEqual(ATLAS_DRAFT.status);
    expect(atlas.version).toEqual(ATLAS_DRAFT.version);
    expect(atlas.wave).toEqual(ATLAS_DRAFT.wave);
  });

  it("returns error 401 when public atlas is PUT requested by logged out user", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          undefined,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when public atlas is PUT requested by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_NORMAL,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("PUT returns error 400 when network value is not a valid network key", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_CONTENT_ADMIN, METHOD.PUT, {
          ...ATLAS_PUBLIC_EDIT,
          network: "notanetwork" as AtlasEditData["network"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when version is a number rather than a string", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_CONTENT_ADMIN, METHOD.PUT, {
          ...ATLAS_PUBLIC_EDIT,
          version: 1 as unknown as AtlasEditData["version"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when wave is not a valid wave value", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_CONTENT_ADMIN, METHOD.PUT, {
          ...ATLAS_PUBLIC_EDIT,
          wave: "0" as AtlasEditData["wave"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when integration lead is undefined", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_CONTENT_ADMIN, METHOD.PUT, {
          ...ATLAS_PUBLIC_EDIT,
          integrationLead:
            undefined as unknown as AtlasEditData["integrationLead"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when integration lead is missing name", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_CONTENT_ADMIN, METHOD.PUT, {
          ...ATLAS_PUBLIC_EDIT,
          integrationLead: {
            email: "bar@example.com",
          } as AtlasEditData["integrationLead"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT updates and returns atlas entry", async () => {
    const updatedAtlas = (
      await doAtlasRequest(
        ATLAS_PUBLIC.id,
        USER_CONTENT_ADMIN,
        METHOD.PUT,
        ATLAS_PUBLIC_EDIT
      )
    )._getJSONData();
    expect(updatedAtlas.overview).toEqual(ATLAS_PUBLIC_EDIT);
    const updatedAtlasFromDb = (
      await query("SELECT * FROM hat.atlases WHERE id=$1", [ATLAS_PUBLIC.id])
    ).rows[0];
    expect(updatedAtlasFromDb.overview).toEqual(ATLAS_PUBLIC_EDIT);
    expect(updatedAtlasFromDb.updated_at.toISOString()).toEqual(
      updatedAtlas.updated_at
    );
  });

  it("PUT updates and returns atlas entry with integration lead set to null", async () => {
    const updatedAtlas = (
      await doAtlasRequest(
        ATLAS_WITH_IL.id,
        USER_CONTENT_ADMIN,
        METHOD.PUT,
        ATLAS_WITH_IL_EDIT
      )
    )._getJSONData();
    expect(updatedAtlas.overview).toEqual(ATLAS_WITH_IL_EDIT);
    const updatedAtlasFromDb = (
      await query("SELECT * FROM hat.atlases WHERE id=$1", [ATLAS_WITH_IL.id])
    ).rows[0];
    expect(updatedAtlasFromDb.overview).toEqual(ATLAS_WITH_IL_EDIT);
    expect(updatedAtlasFromDb.updated_at.toISOString()).toEqual(
      updatedAtlas.updated_at
    );
  });
});

async function doAtlasRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: AtlasEditData
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId },
  });
  await atlasHandler(req, res);
  return res;
}
