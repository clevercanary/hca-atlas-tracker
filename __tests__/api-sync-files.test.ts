import {
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { resetDatabase } from "testing/db-utils";
import { HCAAtlasTrackerDBFile } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { syncFilesFromS3 } from "../app/services/s3-sync";
import syncFilesHandler from "../pages/api/sync-files";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { setTestRandomUuids } from "../testing/setup";
import {
  delay,
  testApiRole,
  withConsoleErrorHiding,
  withConsoleMessageHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const syncMock = syncFilesFromS3 as jest.Mock;

jest.mock("../app/services/s3-sync", () => {
  const s3Sync = jest.requireActual<typeof import("../app/services/s3-sync")>(
    "../app/services/s3-sync"
  );
  return {
    syncFilesFromS3: jest.fn(s3Sync.syncFilesFromS3),
  };
});

const TEST_UUIDS = [
  "9ac2e257-76ae-4220-bcb4-31709533e00d",
  "135d67d9-2a56-42f5-886f-a4c50c239aea",
  "77c65c60-948f-4b0d-be91-6b07bfaa3af8",
  "5126915c-9824-4bd6-8eff-d46ce6e5ab73",
  "ca1a73e7-d7b0-476e-b8db-88ed90c8eb6a",
];

setTestRandomUuids(TEST_UUIDS);

const s3Mock = mockClient(S3Client);

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

const TEST_ROUTE = "/api/sync-files";

const KEY_COMPLETE_FOO = "eye/test-draft-v1-2/integrated-objects/test-a.h5ad";
const KEY_COMPLETE_BAR = "eye/test-draft-v1-2/source-datasets/test-b.h5ad";
const KEY_NO_LENGTH = "eye/test-draft-v1-2/manifests/test-c.json";
const KEY_NO_ETAG = "lung/test-public-v2-3/integrated-objects/test-d.h5ad";
const KEY_NO_MODIFIED = "lung/test-public-v2-3/source-datasets/test-e.h5ad";
const KEY_NO_VERSION = "lung/test-public-v2-3/manifests/test-f.h5ad";
const KEY_KEEP_SUBPATH = "eye/test-draft-v1-2/integrated-objects/.keep";
const KEY_KEEP_ROOT = ".keep";

const HEAD_RESPONSE_COMPLETE_FOO = {
  ContentLength: 234523,
  ETag: "f978b246e4d24ff89aa35ca6a8ebbb1e",
  LastModified: new Date("2025-09-07T04:02:45.369Z"),
  VersionId: "439583",
};

const HEAD_RESPONSE_COMPLETE_BAR = {
  ContentLength: 53234,
  ETag: "a68532232b314c228cbd0a4b8c2932e8",
  LastModified: new Date("2025-09-07T04:07:11.605Z"),
  VersionId: "123432",
};

const HEAD_RESPONSE_NO_LENGTH = {
  ContentLength: undefined,
  ETag: "81519fdd886f432c96bf22e642701e22",
  LastModified: new Date("2025-09-07T04:11:11.324Z"),
  VersionId: "243753",
};

const HEAD_RESPONSE_NO_ETAG = {
  ContentLength: 23982,
  ETag: undefined,
  LastModified: new Date("2025-09-07T04:16:57.149Z"),
  VersionId: "389432",
};

const HEAD_RESPONSE_NO_MODIFIED = {
  ContentLength: 223891,
  ETag: "9b50c05ce7054b77b96159f292d545f2",
  LastModified: undefined,
  VersionId: "843242",
};

const HEAD_RESPONSE_NO_VERSION = {
  ContentLength: 428923,
  ETag: "2f97b65a573443989ee9f5d8eef7ada4",
  LastModified: new Date("2025-09-07T04:18:28.171Z"),
  VersionId: undefined,
};

const HEAD_RESPONSES_BY_KEY = {
  [KEY_COMPLETE_BAR]: HEAD_RESPONSE_COMPLETE_BAR,
  [KEY_COMPLETE_FOO]: HEAD_RESPONSE_COMPLETE_FOO,
  [KEY_NO_ETAG]: HEAD_RESPONSE_NO_ETAG,
  [KEY_NO_LENGTH]: HEAD_RESPONSE_NO_LENGTH,
  [KEY_NO_MODIFIED]: HEAD_RESPONSE_NO_MODIFIED,
  [KEY_NO_VERSION]: HEAD_RESPONSE_NO_VERSION,
};

const LIST_OBJECTS_RESPONSE = {
  Contents: [
    // Includes empty objects to test missing key case
    {},
    { Key: KEY_KEEP_SUBPATH },
    ...Object.keys(HEAD_RESPONSES_BY_KEY).map((key) => ({ Key: key })),
    {},
    {},
    { Key: KEY_KEEP_ROOT },
  ],
};

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (await doSyncFilesRequest(undefined, METHOD.GET))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when POST requested by logged out user", async () => {
    expect(
      (await doSyncFilesRequest(undefined, METHOD.POST, true))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when POST requested by unregistered user", async () => {
    expect(
      (
        await doSyncFilesRequest(USER_UNREGISTERED, METHOD.POST, true)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when POST requested by disabled user", async () => {
    expect(
      (
        await doSyncFilesRequest(USER_DISABLED_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      (...args) => syncFilesHandler(...args),
      METHOD.POST,
      role,
      undefined,
      undefined,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("processes s3 data, logs warnings, and creates files as appropriate when requested by content admin", async () => {
    s3Mock.on(ListObjectsV2Command).resolves(LIST_OBJECTS_RESPONSE);
    for (const [key, response] of Object.entries(HEAD_RESPONSES_BY_KEY)) {
      s3Mock.on(HeadObjectCommand, { Key: key }).resolves(response);
    }

    // Add a minimal delay to guarantee that the new files will be created after the pre-initialized files
    await delay(10);

    const startTime = new Date();

    const consoleMessages = {
      error: [] as unknown[][],
      warn: [] as unknown[][],
    };

    const res = await withConsoleMessageHiding(
      async () => {
        const res = await doSyncFilesRequest(USER_CONTENT_ADMIN, METHOD.POST);
        await resolveSync();
        return res;
      },
      true,
      consoleMessages
    );

    expect(res._getStatusCode()).toBe(202);

    expect(consoleMessages.error).toHaveLength(0);

    const files = await getDbFilesCreatedAfter(startTime);
    expect(files).toHaveLength(5);
  });
});

async function doSyncFilesRequest(
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => syncFilesHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function getDbFilesCreatedAfter(
  date: Date
): Promise<HCAAtlasTrackerDBFile[]> {
  const result = await query<HCAAtlasTrackerDBFile>(
    "SELECT * FROM hat.files WHERE created_at >= $1",
    [date]
  );
  return result.rows;
}

async function resolveSync(): Promise<void> {
  await syncMock.mock.results[syncMock.mock.results.length - 1].value;
}
