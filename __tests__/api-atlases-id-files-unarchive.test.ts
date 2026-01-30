import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { FilesSetIsArchivedData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import unarchiveHandler from "../pages/api/atlases/[atlasId]/files/unarchive";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_ARCHIVED_BAR,
  COMPONENT_ATLAS_ARCHIVED_BAZ,
  COMPONENT_ATLAS_ARCHIVED_FOO,
  COMPONENT_ATLAS_ARCHIVED_FOOFOO,
  FILE_B_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  FILE_MANIFEST_FOO,
  SOURCE_DATASET_ARCHIVED_BAR,
  SOURCE_DATASET_ARCHIVED_BAZ,
  SOURCE_DATASET_ARCHIVED_FOO,
  SOURCE_DATASET_ARCHIVED_FOOBAR,
  SOURCE_DATASET_ARCHIVED_FOOFOO,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectFilesToHaveArchiveStatus,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
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

const UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO: FilesSetIsArchivedData = {
  fileIds: [SOURCE_DATASET_ARCHIVED_FOO.file.id],
};

const UNARCHIVE_DATA_COMPONENT_ATLAS_ARCHIVED_FOO: FilesSetIsArchivedData = {
  fileIds: [COMPONENT_ATLAS_ARCHIVED_FOO.file.id],
};

const TEST_ROUTE = "/api/atlases/[atlasId]/files/unarchive";

describe(`${TEST_ROUTE}`, () => {
  it("returns error 405 when GET requested", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_CONTENT_ADMIN,
          METHOD.GET,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          undefined,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      `returns error 403 when PATCH requested`,
      TEST_ROUTE,
      unarchiveHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES_B.id),
      UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
      },
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when PATCH requested from nonexistent atlas", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_NONEXISTENT.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when source dataset file is PATCH requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when component atlas file is PATCH requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          UNARCHIVE_DATA_COMPONENT_ATLAS_ARCHIVED_FOO,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when PATCH requested with nonexistent file", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: ["99f2129f-b0c6-4c5e-800c-ee50ce8e2907"],
    };
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 400 when PATCH requested with non-latest file", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [FILE_B_COMPONENT_ATLAS_WITH_MULTIPLE_FILES.id],
    };
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 when PATCH requested with already non-archived file", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
    };
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 404 when PATCH requested with manifest file", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [FILE_MANIFEST_FOO.id],
    };
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 400 when PATCH requested with empty file list", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [],
    };
    expect(
      (
        await doUnarchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("unarchives source dataset file when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const INPUT_DATA = UNARCHIVE_DATA_SOURCE_DATASET_ARCHIVED_FOO;
    const res = await doUnarchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      INPUT_DATA,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, false);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ARCHIVED_FOOFOO.file.id],
      true,
    );
  });

  it("unarchives source dataset file when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [SOURCE_DATASET_ARCHIVED_FOOBAR.file.id],
    };
    const res = await doUnarchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, false);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ARCHIVED_FOOFOO.file.id],
      true,
    );
  });

  it("unarchives component atlas file when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA = UNARCHIVE_DATA_COMPONENT_ATLAS_ARCHIVED_FOO;
    const res = await doUnarchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, false);
    await expectFilesToHaveArchiveStatus(
      [COMPONENT_ATLAS_ARCHIVED_FOOFOO.file.id],
      true,
    );
  });

  it("unarchives multiple source dataset and component atlas files when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [
        SOURCE_DATASET_ARCHIVED_BAR.file.id,
        COMPONENT_ATLAS_ARCHIVED_BAR.file.id,
        COMPONENT_ATLAS_ARCHIVED_BAZ.file.id,
        SOURCE_DATASET_ARCHIVED_BAZ.file.id,
      ],
    };
    const res = await doUnarchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, false);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ARCHIVED_FOOFOO.file.id],
      true,
    );
  });
});

async function doUnarchiveRequest(
  atlasId: string,
  body: Record<string, unknown>,
  user?: TestUser,
  method = METHOD.PATCH,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => unarchiveHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
