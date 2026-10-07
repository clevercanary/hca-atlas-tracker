import { METHOD } from "@/app/common/entities";
import { issueApiToken } from "@/app/services/api-tokens";
import { endPgPool } from "@/app/services/database";
import { type Handler } from "@/app/utils/api-handler";
import atlasesHandler from "@/pages/api/atlases";
import componentAtlasHandler from "@/pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";
import presignedUrlHandler from "@/pages/api/atlases/[atlasId]/files/[fileId]/presigned-url";
import meHandler from "@/pages/api/me";
import publishedAtlasesHandler from "@/pages/api/published-atlases";
import snsHandler from "@/pages/api/sns";
import { encodeTestJwt } from "@/testing/api-tokens";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_MISC_FOO,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_NONEXISTENT,
  USER_STAKEHOLDER,
} from "@/testing/constants";
import { resetDatabase } from "@/testing/db-utils";
import { type TestUser } from "@/testing/entities";
import { withConsoleErrorHiding } from "@/testing/utils";
import { type NextApiRequest, type NextApiResponse } from "next";
import httpMocks from "node-mocks-http";

jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/utils/crossref/crossref-api");
jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");
jest.mock("@/app/services/s3-operations");

jest.mock("googleapis");
jest.mock("next-auth");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await endPgPool();
});

interface RequestOptions {
  authorization?: string;
  body?: Record<string, unknown>;
  cookieUser?: TestUser;
  hideConsoleError?: boolean;
  method: METHOD;
  query?: Record<string, string>;
}

interface RejectedTokenCase {
  description: string;
  getAuthorization: () => Promise<string>;
}

const ATLASES_REQUEST = { method: METHOD.GET };

describe("API token authentication", () => {
  it("authenticates a GET request as the token's user", async () => {
    const res = await doRequest(atlasesHandler, {
      ...ATLASES_REQUEST,
      authorization: await bearerFor(USER_STAKEHOLDER),
    });
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData().length).toBeGreaterThan(0);
  });

  it("authenticates a GET request on a route dispatched by method", async () => {
    const res = await doRequest(componentAtlasHandler, {
      authorization: await bearerFor(USER_STAKEHOLDER),
      method: METHOD.GET,
      query: {
        atlasId: ATLAS_DRAFT.id,
        componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
      },
    });
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData().id).toEqual(COMPONENT_ATLAS_DRAFT_FOO.id);
  });

  it("authenticates a GET request on a route that needs no authentication", async () => {
    const res = await doRequest(publishedAtlasesHandler, {
      ...ATLASES_REQUEST,
      authorization: await bearerFor(USER_STAKEHOLDER),
    });
    expect(res._getStatusCode()).toEqual(200);
  });

  it("returns 200 for presigned URL POST by content admin", async () => {
    const res = await doPresignedUrlRequest(
      await bearerFor(USER_CONTENT_ADMIN),
    );
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData().url).toBeDefined();
  });

  it("returns 200 for presigned URL POST by integration lead for their atlas", async () => {
    const res = await doPresignedUrlRequest(
      await bearerFor(USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES),
    );
    expect(res._getStatusCode()).toEqual(200);
  });

  it("returns 403 for presigned URL POST by integration lead for another atlas", async () => {
    const res = await doPresignedUrlRequest(
      await bearerFor(USER_INTEGRATION_LEAD_PUBLIC),
      true,
    );
    expect(res._getStatusCode()).toEqual(403);
  });

  it("returns 403 for presigned URL POST by stakeholder", async () => {
    const res = await doPresignedUrlRequest(
      await bearerFor(USER_STAKEHOLDER),
      true,
    );
    expect(res._getStatusCode()).toEqual(403);
  });

  describe("read-only scope", () => {
    it("returns 403 for PUT /api/me", async () => {
      const res = await doRequest(meHandler, {
        authorization: await bearerFor(USER_CONTENT_ADMIN),
        hideConsoleError: true,
        method: METHOD.PUT,
      });
      expect(res._getStatusCode()).toEqual(403);
    });

    it("returns 403 for PATCH on a route dispatched by method", async () => {
      const res = await doRequest(componentAtlasHandler, {
        authorization: await bearerFor(USER_CONTENT_ADMIN),
        body: {},
        hideConsoleError: true,
        method: METHOD.PATCH,
        query: {
          atlasId: ATLAS_DRAFT.id,
          componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
        },
      });
      expect(res._getStatusCode()).toEqual(403);
    });

    it("returns 403 for POST to a route that needs no authentication", async () => {
      const res = await doRequest(snsHandler, {
        authorization: await bearerFor(USER_CONTENT_ADMIN),
        body: {},
        hideConsoleError: true,
        method: METHOD.POST,
      });
      expect(res._getStatusCode()).toEqual(403);
    });

    it("returns 403 for a non-GET method to a GET-only route", async () => {
      const res = await doRequest(atlasesHandler, {
        authorization: await bearerFor(USER_CONTENT_ADMIN),
        hideConsoleError: true,
        method: METHOD.POST,
      });
      expect(res._getStatusCode()).toEqual(403);
    });
  });

  describe("rejected tokens", () => {
    const rejectedTokenCases: RejectedTokenCase[] = [
      {
        description: "a malformed token",
        getAuthorization: async () => "Bearer not-a-token",
      },
      {
        description: "a non-bearer Authorization header",
        getAuthorization: async () =>
          `Basic ${Buffer.from("a:b").toString("base64")}`,
      },
      {
        description: "an empty bearer token",
        getAuthorization: async () => "Bearer ",
      },
      {
        description: "an expired token",
        getAuthorization: async () =>
          `Bearer ${await encodeTestJwt({
            maxAge: -60,
            token: { email: USER_CONTENT_ADMIN.email, scope: "api-read" },
          })}`,
      },
      {
        description: "a token with the wrong scope",
        getAuthorization: async () =>
          `Bearer ${await encodeTestJwt({
            token: { email: USER_CONTENT_ADMIN.email, scope: "api-write" },
          })}`,
      },
      {
        description: "a session token",
        getAuthorization: async () =>
          `Bearer ${await encodeTestJwt({
            salt: "",
            token: { email: USER_CONTENT_ADMIN.email },
          })}`,
      },
      {
        description: "a token for an unknown user",
        getAuthorization: () => bearerFor(USER_NONEXISTENT),
      },
      {
        description: "a token for a disabled user",
        getAuthorization: () => bearerFor(USER_DISABLED_CONTENT_ADMIN),
      },
    ];

    for (const { description, getAuthorization } of rejectedTokenCases) {
      it(`returns 401 for ${description}`, async () => {
        const res = await doRequest(atlasesHandler, {
          ...ATLASES_REQUEST,
          authorization: await getAuthorization(),
          hideConsoleError: true,
        });
        expect(res._getStatusCode()).toEqual(401);
      });

      it(`returns 401 for ${description} even with a valid session cookie`, async () => {
        const res = await doRequest(atlasesHandler, {
          ...ATLASES_REQUEST,
          authorization: await getAuthorization(),
          cookieUser: USER_CONTENT_ADMIN,
          hideConsoleError: true,
        });
        expect(res._getStatusCode()).toEqual(401);
      });

      it(`returns 401 for ${description} on a route that needs no authentication`, async () => {
        const res = await doRequest(publishedAtlasesHandler, {
          ...ATLASES_REQUEST,
          authorization: await getAuthorization(),
          hideConsoleError: true,
        });
        expect(res._getStatusCode()).toEqual(401);
      });

      it(`returns 401 rather than 403 for ${description} with a non-GET method`, async () => {
        const res = await doRequest(meHandler, {
          authorization: await getAuthorization(),
          hideConsoleError: true,
          method: METHOD.PUT,
        });
        expect(res._getStatusCode()).toEqual(401);
      });
    }
  });

  it("does not leak the token into the error response", async () => {
    const authorization = "Bearer some-secret-looking-token";
    const res = await doRequest(atlasesHandler, {
      ...ATLASES_REQUEST,
      authorization,
      hideConsoleError: true,
    });
    expect(res._getStatusCode()).toEqual(401);
    expect(res._getData()).not.toContain("some-secret-looking-token");
  });
});

async function bearerFor(user: TestUser): Promise<string> {
  return `Bearer ${(await issueApiToken(user.email)).token}`;
}

async function doPresignedUrlRequest(
  authorization: string,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  return await doRequest(presignedUrlHandler, {
    authorization,
    hideConsoleError,
    method: METHOD.POST,
    query: {
      atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      fileId: COMPONENT_ATLAS_MISC_FOO.file.id,
    },
  });
}

async function doRequest(
  handler: Handler,
  {
    authorization,
    body,
    cookieUser,
    hideConsoleError = false,
    method,
    query,
  }: RequestOptions,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization, cookie: cookieUser?.cookie },
    method,
    query,
  });
  await withConsoleErrorHiding(() => handler(req, res), hideConsoleError);
  return res;
}
