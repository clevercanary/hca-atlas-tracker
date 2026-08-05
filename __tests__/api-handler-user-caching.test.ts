import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { query } from "@/app/services/database";
import {
  getRegisteredActiveUser,
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  registeredUser,
  role,
} from "@/app/utils/api-handler";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  USER_INTEGRATION_LEAD_DRAFT,
} from "@/testing/constants";
import { resetDatabase } from "@/testing/db-utils";
import type { TestUser } from "@/testing/entities";
import { withConsoleErrorHiding } from "@/testing/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import httpMocks from "node-mocks-http";

// Wrap the real implementations in mock functions so calls can be counted; the
// point of these tests is how many times the user is looked up per request.
jest.mock("@/app/services/database", () => {
  const actual = jest.requireActual<typeof import("@/app/services/database")>(
    "@/app/services/database",
  );
  return { ...actual, __esModule: true, query: jest.fn(actual.query) };
});

jest.mock("next-auth", () => {
  const nextAuthMock = jest.requireActual<
    typeof import("@/__mocks__/next-auth")
  >("@/__mocks__/next-auth");
  return {
    __esModule: true,
    getServerSession: jest.fn(nextAuthMock.getServerSession),
  };
});

jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

const roleAndAtlasHandler = handler(
  method(METHOD.PUT),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    await getRegisteredActiveUser(req, res);
    res.status(200).end();
  },
);

const registeredUserHandler = handler(
  method(METHOD.PUT),
  registeredUser,
  async (req, res) => {
    await getRegisteredActiveUser(req, res);
    res.status(200).end();
  },
);

beforeAll(async () => {
  await resetDatabase();
});

beforeEach(() => {
  mockQuery.mockClear();
  mockGetServerSession.mockClear();
});

describe("API handler user info sharing", () => {
  it("queries the user once when role and atlas-association middleware and the handler body all need it", async () => {
    const res = await doRequest(
      roleAndAtlasHandler,
      USER_INTEGRATION_LEAD_DRAFT,
      ATLAS_DRAFT.id,
    );
    expect(res._getStatusCode()).toEqual(200);
    expect(getUsersQueryCount()).toEqual(1);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it("queries the user once when registered user middleware and the handler body both need it", async () => {
    const res = await doRequest(
      registeredUserHandler,
      USER_INTEGRATION_LEAD_DRAFT,
      ATLAS_DRAFT.id,
    );
    expect(res._getStatusCode()).toEqual(200);
    expect(getUsersQueryCount()).toEqual(1);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it("queries the user again for a subsequent request", async () => {
    await doRequest(
      roleAndAtlasHandler,
      USER_INTEGRATION_LEAD_DRAFT,
      ATLAS_DRAFT.id,
    );
    await doRequest(
      roleAndAtlasHandler,
      USER_INTEGRATION_LEAD_DRAFT,
      ATLAS_DRAFT.id,
    );
    expect(getUsersQueryCount()).toEqual(2);
    expect(mockGetServerSession).toHaveBeenCalledTimes(2);
  });

  it("rejects an integration lead for an atlas they aren't associated with, using the shared user info", async () => {
    const res = await doRequest(
      roleAndAtlasHandler,
      USER_INTEGRATION_LEAD_DRAFT,
      ATLAS_PUBLIC.id,
    );
    expect(res._getStatusCode()).toEqual(403);
    expect(getUsersQueryCount()).toEqual(1);
  });

  it("reads the session once when the request is made by a logged out user", async () => {
    const res = await withConsoleErrorHiding(() =>
      doRequest(roleAndAtlasHandler, undefined, ATLAS_DRAFT.id),
    );
    expect(res._getStatusCode()).toEqual(401);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });
});

/**
 * Get the number of queries made against the users table since the mocks were last cleared.
 * @returns number of users queries.
 */
function getUsersQueryCount(): number {
  return mockQuery.mock.calls.filter(
    ([queryText]) =>
      typeof queryText === "string" && queryText.includes("hat.users"),
  ).length;
}

/**
 * Make a request to the given handler as the given user.
 * @param testHandler - Handler to make the request to.
 * @param user - User to make the request as, or undefined to make it logged out.
 * @param atlasId - Value of the request's `atlasId` parameter.
 * @returns mock response.
 */
async function doRequest(
  testHandler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  user: TestUser | undefined,
  atlasId: string,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method: METHOD.PUT,
    query: { atlasId },
  });
  await testHandler(req, res);
  return res;
}
