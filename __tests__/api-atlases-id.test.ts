import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbAtlasToApiAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import atlasHandler from "../pages/api/atlases/[atlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");

const ATLAS_PUBLIC_EDIT: AtlasEditData = {
  integrationLead: [
    {
      email: "bar@example.com",
      name: "Bar",
    },
  ],
  network: ATLAS_PUBLIC.network,
  shortName: "test-public-edited",
  version: "2.0",
  wave: "2",
};

const ATLAS_WITH_IL_EDIT: AtlasEditData = {
  integrationLead: [],
  network: "development",
  shortName: ATLAS_WITH_IL.shortName,
  version: "2.1",
  wave: ATLAS_WITH_IL.wave,
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
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

  it("returns error 401 when public atlas is GET requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_PUBLIC.id))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when public atlas is GET requested by unregistered user", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_UNREGISTERED)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when draft atlas is GET requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_DRAFT.id))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when draft atlas is GET requested by unregistered user", async () => {
    expect(
      (await doAtlasRequest(ATLAS_DRAFT.id, USER_UNREGISTERED))._getStatusCode()
    ).toEqual(403);
  });

  it("returns public atlas when GET requested by user with STAKEHOLDER role", async () => {
    const res = await doAtlasRequest(ATLAS_PUBLIC.id, USER_STAKEHOLDER);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.shortName).toEqual(ATLAS_PUBLIC.shortName);
  });

  it("returns draft atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doAtlasRequest(ATLAS_DRAFT.id, USER_STAKEHOLDER);
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

  it("returns error 403 when public atlas is PUT requested by unregistered user", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_UNREGISTERED,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when public atlas is PUT requested by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_STAKEHOLDER,
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
          integrationLead: [
            {
              email: "bar@example.com",
            },
          ] as AtlasEditData["integrationLead"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT updates and returns atlas entry", async () => {
    const updatedAtlas: HCAAtlasTrackerAtlas = (
      await doAtlasRequest(
        ATLAS_PUBLIC.id,
        USER_CONTENT_ADMIN,
        METHOD.PUT,
        ATLAS_PUBLIC_EDIT
      )
    )._getJSONData();
    const updatedAtlasFromDb = (
      await query<HCAAtlasTrackerDBAtlas>(
        "SELECT * FROM hat.atlases WHERE id=$1",
        [ATLAS_PUBLIC.id]
      )
    ).rows[0];
    expect(updatedAtlasFromDb.overview).toMatchObject(ATLAS_PUBLIC_EDIT);
    expect(dbAtlasToApiAtlas(updatedAtlasFromDb)).toEqual(updatedAtlas);
  });

  it("PUT updates and returns atlas entry with integration lead set to null", async () => {
    const updatedAtlas: HCAAtlasTrackerAtlas = (
      await doAtlasRequest(
        ATLAS_WITH_IL.id,
        USER_CONTENT_ADMIN,
        METHOD.PUT,
        ATLAS_WITH_IL_EDIT
      )
    )._getJSONData();
    const updatedAtlasFromDb = (
      await query<HCAAtlasTrackerDBAtlas>(
        "SELECT * FROM hat.atlases WHERE id=$1",
        [ATLAS_WITH_IL.id]
      )
    ).rows[0];
    expect(updatedAtlasFromDb.overview).toMatchObject(ATLAS_WITH_IL_EDIT);
    expect(dbAtlasToApiAtlas(updatedAtlasFromDb)).toEqual(updatedAtlas);
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
