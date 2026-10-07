import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import {
  API_TOKEN_MAX_AGE,
  issueApiToken,
  verifyApiToken,
} from "@/app/services/api-tokens";
import { endPgPool } from "@/app/services/database";
import apiTokenHandler from "@/pages/api/me/api-token";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_CONTENT_ADMIN_API_TOKEN_ISSUER,
  USER_DISABLED_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_STAKEHOLDER_API_TOKEN_ISSUER,
  USER_UNREGISTERED,
} from "@/testing/constants";
import { resetDatabase } from "@/testing/db-utils";
import { type TestUser } from "@/testing/entities";
import { testApiRole, withConsoleErrorHiding } from "@/testing/utils";
import { type NextApiRequest, type NextApiResponse } from "next";
import httpMocks from "node-mocks-http";

jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/utils/crossref/crossref-api");
jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/me/api-token";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (
        await doApiTokenRequest(USER_CONTENT_ADMIN_API_TOKEN_ISSUER, {
          method: METHOD.GET,
        })
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doApiTokenRequest(undefined, { hideConsoleError: true })
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doApiTokenRequest(USER_UNREGISTERED, { hideConsoleError: true })
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 for disabled content admin", async () => {
    expect(
      (
        await doApiTokenRequest(USER_DISABLED_CONTENT_ADMIN, {
          hideConsoleError: true,
        })
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      apiTokenHandler,
      METHOD.POST,
      role,
      undefined,
      undefined,
      true,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      },
    );
  }

  it("returns error 403 for stakeholder who has the API token flag", async () => {
    expect(
      (
        await doApiTokenRequest(USER_STAKEHOLDER_API_TOKEN_ISSUER, {
          hideConsoleError: true,
        })
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 for content admin without the API token flag", async () => {
    const res = await doApiTokenRequest(USER_CONTENT_ADMIN, {
      hideConsoleError: true,
    });
    expect(res._getStatusCode()).toEqual(403);
    expect(res._getJSONData().message).toEqual(
      "API tokens are not enabled for your account",
    );
  });

  it("returns error 403 when requested with an API token", async () => {
    const { token } = await issueApiToken(
      USER_CONTENT_ADMIN_API_TOKEN_ISSUER.email,
    );
    expect(
      (
        await doApiTokenRequest(undefined, {
          authorization: `Bearer ${token}`,
          hideConsoleError: true,
        })
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when requested with an API token alongside a valid session", async () => {
    const { token } = await issueApiToken(
      USER_CONTENT_ADMIN_API_TOKEN_ISSUER.email,
    );
    expect(
      (
        await doApiTokenRequest(USER_CONTENT_ADMIN_API_TOKEN_ISSUER, {
          authorization: `Bearer ${token}`,
          hideConsoleError: true,
        })
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("issues a token for content admin with the API token flag", async () => {
    const requestTime = Date.now();
    const res = await doApiTokenRequest(USER_CONTENT_ADMIN_API_TOKEN_ISSUER);
    expect(res._getStatusCode()).toEqual(201);
    const { expires, token }: HCAAtlasTrackerIssuedApiToken =
      res._getJSONData();
    expect(await verifyApiToken(token)).toEqual(
      USER_CONTENT_ADMIN_API_TOKEN_ISSUER.email,
    );
    expect(
      Math.abs(
        new Date(expires).getTime() - (requestTime + API_TOKEN_MAX_AGE * 1000),
      ),
    ).toBeLessThan(2000);
  });

  it("issues the token for the session user regardless of the request body", async () => {
    const res = await doApiTokenRequest(USER_CONTENT_ADMIN_API_TOKEN_ISSUER, {
      body: { email: USER_STAKEHOLDER.email, userId: 1 },
    });
    expect(res._getStatusCode()).toEqual(201);
    const { token }: HCAAtlasTrackerIssuedApiToken = res._getJSONData();
    expect(await verifyApiToken(token)).toEqual(
      USER_CONTENT_ADMIN_API_TOKEN_ISSUER.email,
    );
  });
});

interface RequestOptions {
  authorization?: string;
  body?: Record<string, unknown>;
  hideConsoleError?: boolean;
  method?: METHOD;
}

async function doApiTokenRequest(
  user: TestUser | undefined,
  {
    authorization,
    body,
    hideConsoleError = false,
    method = METHOD.POST,
  }: RequestOptions = {},
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization, cookie: user?.cookie },
    method,
  });
  await withConsoleErrorHiding(
    () => apiTokenHandler(req, res),
    hideConsoleError,
  );
  return res;
}
