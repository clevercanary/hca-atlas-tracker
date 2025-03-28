import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
  PublicationInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { getSheetTitleForApi } from "../app/utils/google-sheets";
import createHandler from "../pages/api/atlases/create";
import {
  DOI_NONEXISTENT,
  DOI_PREPRINT_NO_JOURNAL,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectDbAtlasToMatchApi,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");
jest.mock("googleapis");

const getSheetTitleMock = getSheetTitleForApi as jest.Mock;

jest.mock("../app/utils/google-sheets", () => {
  const googleSheets: typeof import("../app/utils/google-sheets") =
    jest.requireActual("../app/utils/google-sheets");

  return {
    InvalidSheetError: googleSheets.InvalidSheetError,
    getSheetTitleForApi: jest.fn(googleSheets.getSheetTitleForApi),
  };
});

const NEW_ATLAS_DATA: NewAtlasData = {
  cellxgeneAtlasCollection: "7a223dd3-a422-4f4b-a437-90b9a3b00ba8",
  codeLinks: [{ url: "https://example.com/new-atlas-foo" }],
  description: "foo bar baz baz foo bar",
  dois: [DOI_PREPRINT_NO_JOURNAL],
  highlights: "bar foo baz baz baz foo",
  integrationLead: [],
  metadataCorrectnessUrl:
    "https://example.com/new-atlas-foo-metadata-correctness",
  network: "eye",
  shortName: "test",
  status: ATLAS_STATUS.IN_PROGRESS,
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

const NEW_ATLAS_WITH_NONEXISTENT_PUBLICATION: NewAtlasData = {
  dois: [DOI_NONEXISTENT],
  integrationLead: [],
  network: "lung",
  shortName: "test6",
  version: "2.3",
  wave: "1",
};

const NEW_ATLAS_COMPLETE: NewAtlasData = {
  integrationLead: [],
  network: "kidney",
  shortName: "test7",
  status: ATLAS_STATUS.OC_ENDORSED,
  version: "6.2",
  wave: "1",
};

const NEW_ATLAS_WITH_METADATA_SPECIFICATION: NewAtlasData = {
  integrationLead: [],
  metadataSpecificationUrl:
    "https://docs.google.com/spreadsheets/d/new-atlas-with-metadata-specification/edit",
  network: "nervous-system",
  shortName: "test8",
  version: "2.5",
  wave: "3",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  jest.resetAllMocks();
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
      (await doCreateTest(undefined, NEW_ATLAS_DATA, true))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(USER_UNREGISTERED, NEW_ATLAS_DATA, true)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doCreateTest(USER_DISABLED_CONTENT_ADMIN, NEW_ATLAS_DATA)
      )._getStatusCode()
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

  it("returns error 400 when cellxgene id is not a uuid", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            cellxgeneAtlasCollection: "not-a-uuid",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when link url is not a url", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            codeLinks: [{ url: "not-a-url" }],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when highlights are too long", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            highlights: "x".repeat(10001),
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when dois are non-unique", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            dois: ["10.123/foo", "https://doi.org/10.123/foo"],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when metadata specification is not a google sheets url", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            metadataSpecificationUrl: "https://example.com",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when metadata specification sheet doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_WITH_METADATA_SPECIFICATION,
            metadataSpecificationUrl:
              "https://docs.google.com/spreadsheets/d/nonexistent/edit",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when metadata correctness report is not a url", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            metadataCorrectnessUrl: "not-a-url",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when status is not a valid atlas status", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_ATLAS_DATA,
            status: "NOT_AN_ATLAS_STATUS",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns atlas entry with no integration leads", async () => {
    await testSuccessfulCreate(NEW_ATLAS_DATA, [
      PUBLICATION_PREPRINT_NO_JOURNAL,
    ]);
  });

  it("creates and returns atlas entry with specified integration lead", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_IL_DATA, []);
  });

  it("creates and returns atlas entry with multiple integration leads", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_MULTIPLE_ILS, []);
  });

  it("creates and returns atlas entry with target completion", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_TARGET_COMPLETION, []);
  });

  it("creates and returns atlas entry without description", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITHOUT_DESCRIPTION, []);
  });

  it("creates and returns atlas entry with nonexistent publication", async () => {
    await testSuccessfulCreate(NEW_ATLAS_WITH_NONEXISTENT_PUBLICATION, [null]);
  });

  it("creates and returns atlas entry with status set to COMPLETE", async () => {
    await testSuccessfulCreate(NEW_ATLAS_COMPLETE, []);
  });

  it("creates and returns atlas entry with retrieved metadata specification title, calling getSheetTitle", async () => {
    const callCountBefore = getSheetTitleMock.mock.calls.length;
    await testSuccessfulCreate(
      NEW_ATLAS_WITH_METADATA_SPECIFICATION,
      [],
      "New Atlas With Metadata Specification Sheet"
    );
    expect(getSheetTitleMock).toHaveBeenCalledTimes(callCountBefore + 1);
  });
});

async function testSuccessfulCreate(
  atlasData: NewAtlasData,
  expectedPublicationsInfo: (PublicationInfo | null)[],
  expectedMetadataSpecificationTitle?: string
): Promise<void> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlasData);
  expect(res._getStatusCode()).toEqual(201);
  const newAtlas: HCAAtlasTrackerAtlas = res._getJSONData();
  const newAtlasFromDb = await getAtlasFromDb(newAtlas.id);
  expect(newAtlasFromDb.source_studies).toEqual([]);
  expect(newAtlasFromDb.status).toEqual(
    atlasData.status ?? ATLAS_STATUS.IN_PROGRESS
  );
  expect(newAtlasFromDb.target_completion).toEqual(
    atlasData.targetCompletion ? new Date(atlasData.targetCompletion) : null
  );
  expect(newAtlasFromDb.overview.cellxgeneAtlasCollection).toEqual(
    atlasData.cellxgeneAtlasCollection ?? null
  );
  expect(newAtlasFromDb.overview.codeLinks).toEqual(atlasData.codeLinks ?? []);
  expect(newAtlasFromDb.overview.description).toEqual(
    atlasData.description ?? ""
  );
  expect(newAtlasFromDb.overview.highlights).toEqual(
    atlasData.highlights ?? ""
  );
  expect(newAtlasFromDb.overview.integrationLead).toEqual(
    atlasData.integrationLead
  );
  expect(newAtlasFromDb.overview.metadataSpecificationTitle).toEqual(
    expectedMetadataSpecificationTitle ?? null
  );
  expect(newAtlasFromDb.overview.metadataSpecificationUrl).toEqual(
    atlasData.metadataSpecificationUrl ?? null
  );
  expect(newAtlasFromDb.overview.network).toEqual(atlasData.network);
  expect(newAtlasFromDb.overview.publications.map((p) => p.doi)).toEqual(
    atlasData.dois ?? []
  );
  expect(
    newAtlasFromDb.overview.publications.map((p) => p.publication)
  ).toEqual(expectedPublicationsInfo);
  expect(newAtlasFromDb.overview.shortName).toEqual(atlasData.shortName);
  expect(newAtlasFromDb.overview.version).toEqual(atlasData.version);
  expect(newAtlasFromDb.overview.wave).toEqual(atlasData.wave);
  expect(newAtlasFromDb.overview.taskCount).toEqual(0);
  expect(newAtlasFromDb.overview.completedTaskCount).toEqual(0);
  expectDbAtlasToMatchApi(newAtlasFromDb, newAtlas);
}

async function doCreateTest(
  user: TestUser | undefined,
  newData: Record<string, unknown>,
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
