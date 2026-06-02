import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { syncFilesFromS3 } from "../app/services/s3-sync";
import syncFilesHandler from "../pages/api/sync-files";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/s3-sync");

jest.mock("next-auth");

const syncMock = syncFilesFromS3 as jest.Mock;

afterAll(() => {
  endPgPool();
});

const TEST_ROUTE = "/api/sync-files";

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (await doSyncFilesRequest(undefined, METHOD.GET))._getStatusCode(),
    ).toEqual(405);
  });

  it("returns 501 for POST regardless of session or role, without invoking the S3 sync", async () => {
    for (const user of [
      undefined,
      USER_UNREGISTERED,
      USER_STAKEHOLDER,
      USER_CONTENT_ADMIN,
    ]) {
      const res = await doSyncFilesRequest(user, METHOD.POST, true);
      expect(res._getStatusCode()).toEqual(501);
      expect(res._getJSONData()).toEqual({
        message:
          "S3 sync via this endpoint is disabled. File ingest is driven by " +
          "S3 event notifications (processS3NotificationMessage). This route " +
          "is preserved for possible future re-enablement.",
      });
    }
    expect(syncMock).not.toHaveBeenCalled();
  });
});

async function doSyncFilesRequest(
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => syncFilesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
