import { METHOD } from "app/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { endPgPool } from "../app/services/database";
import cellxgeneIdsHandler from "../pages/api/source-study-cellxgene-ids";
import {
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_SOURCE_STUDIES,
  USER_CELLXGENE_ADMIN,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const expectedIds = TEST_SOURCE_STUDIES.reduce((ids: string[], testStudy) => {
  let id: string | null = null;
  if ("doi" in testStudy && testStudy.cellxgeneCollectionId === undefined) {
    id =
      (testStudy.doi &&
        TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(testStudy.doi)?.collection_id) ??
      null;
  } else {
    id = testStudy.cellxgeneCollectionId ?? null;
  }
  if (id !== null) ids.push(id);
  return ids;
}, []);

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/comments", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doCellxGeneIdsTest(undefined, false, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns IDs for logged out user", async () => {
    await testSuccessfulResponse();
  });

  it("returns IDs for for unregistered user", async () => {
    await testSuccessfulResponse(USER_UNREGISTERED);
  });

  it("returns IDs for disabled user", async () => {
    await testSuccessfulResponse(USER_DISABLED_CONTENT_ADMIN);
  });

  it("returns IDs for user with STAKEHOLDER role", async () => {
    await testSuccessfulResponse(USER_STAKEHOLDER);
  });

  it("returns IDs for user with INTEGRATION_LEAD role", async () => {
    await testSuccessfulResponse(USER_INTEGRATION_LEAD_DRAFT);
  });

  it("returns IDs for user with CELLXGENE_ADMIN role", async () => {
    await testSuccessfulResponse(USER_CELLXGENE_ADMIN);
  });

  it("returns IDs for user with CONTENT_ADMIN role", async () => {
    await testSuccessfulResponse(USER_CONTENT_ADMIN);
  });
});

async function testSuccessfulResponse(user?: TestUser): Promise<void> {
  const res = await doCellxGeneIdsTest(user);
  expect(res._getStatusCode()).toEqual(200);
  const ids: string[] = res._getJSONData();
  expect(ids.length).toEqual(expectedIds.length);
  expect(ids).toEqual(expect.arrayContaining(expectedIds));
}

async function doCellxGeneIdsTest(
  user: TestUser | undefined,
  hideConsoleError = false,
  method = METHOD.GET,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => cellxgeneIdsHandler(req, res),
    hideConsoleError,
  );
  return res;
}
