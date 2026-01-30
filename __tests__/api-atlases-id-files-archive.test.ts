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
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_MISC_BAR,
  COMPONENT_ATLAS_MISC_BAZ,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS,
  FILE_A_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  FILE_MANIFEST_FOO,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
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

const ARCHIVE_DATA_SOURCE_DATASET_A_BAR: FilesSetIsArchivedData = {
  fileIds: [SOURCE_DATASET_ATLAS_LINKED_A_BAR.file.id],
};

const ARCHIVE_DATA_COMPONENT_ATLAS_MISC_FOO: FilesSetIsArchivedData = {
  fileIds: [COMPONENT_ATLAS_MISC_FOO.file.id],
};

const TEST_ROUTE = "/api/atlases/[atlasId]/files/archive";

describe(`${TEST_ROUTE}`, () => {
  it("returns error 405 when GET requested", async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
          USER_CONTENT_ADMIN,
          METHOD.GET,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
      archiveHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id),
      ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
      },
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
        await doArchiveRequest(
          ATLAS_NONEXISTENT.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          ARCHIVE_DATA_SOURCE_DATASET_A_BAR,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          ARCHIVE_DATA_COMPONENT_ATLAS_MISC_FOO,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
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
      fileIds: [FILE_A_COMPONENT_ATLAS_WITH_MULTIPLE_FILES.id],
    };
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 when PATCH requested with already-archived file", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST.id],
    };
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
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
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when PATCH requested with various files not on the atlas", async () => {
    const WRONG_ATLAS_FILE_IDS = [
      FILE_MANIFEST_FOO.id,
      FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.id,
      COMPONENT_ATLAS_DRAFT_FOO.file.id,
    ];
    const RIGHT_ATLAS_FILE_IDS = [
      SOURCE_DATASET_ATLAS_LINKED_B_BAR.file.id,
      COMPONENT_ATLAS_MISC_BAR.file.id,
    ];
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [...WRONG_ATLAS_FILE_IDS, ...RIGHT_ATLAS_FILE_IDS],
    };
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      true,
    );
    expect(res._getStatusCode()).toEqual(404);
    const { message } = res._getJSONData();
    for (const id of WRONG_ATLAS_FILE_IDS) {
      expect(message).toEqual(expect.stringContaining(id));
    }
    for (const id of RIGHT_ATLAS_FILE_IDS) {
      expect(message).not.toEqual(expect.stringContaining(id));
    }
  });

  it("returns error 400 when PATCH requested with empty file list", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [],
    };
    expect(
      (
        await doArchiveRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("archives source dataset file when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const INPUT_DATA = ARCHIVE_DATA_SOURCE_DATASET_A_BAR;
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      INPUT_DATA,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, true);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
      false,
    );
  });

  it("archives source dataset file when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [SOURCE_DATASET_ATLAS_LINKED_B_FOO.file.id],
    };
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, true);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
      false,
    );
  });

  it("archives component atlas file when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA = ARCHIVE_DATA_COMPONENT_ATLAS_MISC_FOO;
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, true);
    await expectFilesToHaveArchiveStatus(
      [COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.file.id],
      false,
    );
  });

  it("archives multiple source dataset and component atlas files when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const INPUT_DATA: FilesSetIsArchivedData = {
      fileIds: [
        SOURCE_DATASET_ATLAS_LINKED_B_BAR.file.id,
        COMPONENT_ATLAS_MISC_BAR.file.id,
        COMPONENT_ATLAS_MISC_BAZ.file.id,
        SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO.file.id,
      ],
    };
    const res = await doArchiveRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      INPUT_DATA,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      false,
    );
    expect(res._getStatusCode()).toEqual(200);
    await expectFilesToHaveArchiveStatus(INPUT_DATA.fileIds, true);
    await expectFilesToHaveArchiveStatus(
      [SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id],
      false,
    );
  });
});

async function doArchiveRequest(
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
    () => archiveHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
