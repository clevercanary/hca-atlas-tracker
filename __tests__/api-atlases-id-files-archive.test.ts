import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { FilesSetIsArchivedData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import archiveHandler from "../pages/api/atlases/[atlasId]/files/archive";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectFilesToHaveArchiveStatus,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("../app/services/s3-operations");

jest.mock("googleapis");
jest.mock("next-auth");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

const ARCHIVE_DATA_NON_LATEST: FilesSetIsArchivedData = {
  fileIds: [COMPONENT_ATLAS_WITH_MULTIPLE_FILES.file[0].id],
};

const ARCHIVE_DATA_ALREADY_ARCHIVED: FilesSetIsArchivedData = {
  fileIds: [COMPONENT_ATLAS_WITH_ARCHIVED_LATEST.file[1].id],
};

const ARCHIVE_DATA_SOURCE_DATASET_A_BAR: FilesSetIsArchivedData = {
  fileIds: [SOURCE_DATASET_ATLAS_LINKED_A_BAR.file.id],
};

const ARCHIVE_DATA_SOURCE_DATASET_B_FOO: FilesSetIsArchivedData = {
  fileIds: [SOURCE_DATASET_ATLAS_LINKED_B_FOO.file.id],
};

const TEST_ROUTE = "/api/atlases/[atlasId]/files/[fileId]/presigned-url";

describe(`${TEST_ROUTE}`, () => {
  it(`returns error 405 when GET requested`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_CONTENT_ADMIN,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it(`returns error 401 when PATCH requested by logged out user`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          undefined,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it(`returns error 403 when PATCH requested by unregistered user`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it(`returns error 403 when PATCH requested by disabled user`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      `returns error 403 when PATCH requested`,
      TEST_ROUTE,
      archiveHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id),
      ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it(`returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it(`returns error 404 when PATCH requested from nonexistent atlas`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_NONEXISTENT.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it(`returns error 404 when PATCH requested with non-latest file`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          ARCHIVE_DATA_NON_LATEST,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it(`returns error 400 when PATCH requested with already-archived file`, async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          ARCHIVE_DATA_ALREADY_ARCHIVED,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it(`archives source dataset file when PATCH requested by user with INTEGRATION_LEAD role for the atlas`, async () => {
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      false
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(
      ARCHIVE_DATA_SOURCE_DATASET_A_BAR.fileIds,
      true
    );
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
      false
    );
  });

  it(`archives source dataset file when PATCH requested by user with CONTENT_ADMIN role`, async () => {
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      ARCHIVE_DATA_SOURCE_DATASET_B_FOO,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(
      ARCHIVE_DATA_SOURCE_DATASET_B_FOO.fileIds,
      true
    );
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
      false
    );
  });
});

async function doArchiveRequest(
  atlasId: string,
  body: Record<string, unknown>,
  user?: TestUser,
  method = METHOD.PATCH,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => archiveHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
