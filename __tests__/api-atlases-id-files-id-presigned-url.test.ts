import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { PresignedUrlInfo } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import presignedUrlHandler from "../pages/api/atlases/[atlasId]/files/[fileId]/presigned-url";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_MISC_FOO,
  FILE_MANIFEST_FOO,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestFile, TestUser } from "../testing/entities";
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

const TEST_ROUTE = "/api/atlases/[atlasId]/files/[fileId]/presigned-url";

describe(`${TEST_ROUTE}`, () => {
  const entityTypeParams = [
    {
      entityType: "source dataset",
      testFile: SOURCE_DATASET_ATLAS_LINKED_A_FOO.file,
    },
    {
      entityType: "integrated object",
      testFile: COMPONENT_ATLAS_MISC_FOO.file,
    },
  ];
  for (const { entityType, testFile } of entityTypeParams) {
    it(`returns error 405 for GET request to ${entityType} file`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_WITH_MISC_SOURCE_STUDIES.id,
            testFile.id,
            USER_CONTENT_ADMIN,
            METHOD.GET
          )
        )._getStatusCode()
      ).toEqual(405);
    });

    it(`returns error 401 when ${entityType} file is POST requested by logged out user`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_WITH_MISC_SOURCE_STUDIES.id,
            testFile.id,
            undefined,
            METHOD.POST,
            true
          )
        )._getStatusCode()
      ).toEqual(401);
    });

    it(`returns error 403 when ${entityType} file is POST requested by unregistered user`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_WITH_MISC_SOURCE_STUDIES.id,
            testFile.id,
            USER_UNREGISTERED,
            METHOD.POST,
            true
          )
        )._getStatusCode()
      ).toEqual(403);
    });

    it(`returns error 403 when ${entityType} file is POST requested by disabled user`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_WITH_MISC_SOURCE_STUDIES.id,
            testFile.id,
            USER_DISABLED_CONTENT_ADMIN,
            METHOD.POST,
            false
          )
        )._getStatusCode()
      ).toEqual(403);
    });

    for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
      testApiRole(
        `returns error 403 for ${entityType} file`,
        TEST_ROUTE,
        presignedUrlHandler,
        METHOD.POST,
        role,
        getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id, testFile.id),
        undefined,
        false,
        async (res) => {
          expect(res._getStatusCode()).toEqual(403);
        }
      );
    }

    it(`returns error 403 when ${entityType} file is POST requested by user with INTEGRATION_LEAD role for another atlas`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_WITH_MISC_SOURCE_STUDIES.id,
            testFile.id,
            USER_INTEGRATION_LEAD_PUBLIC,
            METHOD.POST,
            false
          )
        )._getStatusCode()
      ).toEqual(403);
    });

    it(`returns error 404 when ${entityType} file is POST requested from nonexistent atlas`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_NONEXISTENT.id,
            testFile.id,
            USER_CONTENT_ADMIN,
            METHOD.POST,
            true
          )
        )._getStatusCode()
      ).toEqual(404);
    });

    it(`returns error 404 when ${entityType} file is POST requested from atlas it doesn't exist on`, async () => {
      expect(
        (
          await doPresignedUrlRequest(
            ATLAS_DRAFT.id,
            testFile.id,
            USER_CONTENT_ADMIN,
            METHOD.POST,
            true
          )
        )._getStatusCode()
      ).toEqual(404);
    });

    it(`returns file URL when ${entityType} file is POST requested by user with INTEGRATION_LEAD role for the atlas`, async () => {
      const res = await doPresignedUrlRequest(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        testFile.id,
        USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
        METHOD.POST,
        false
      );
      expect(res._getStatusCode()).toEqual(200);
      const urlInfo = res._getJSONData() as PresignedUrlInfo;
      expectUrlForFile(urlInfo.url, testFile);
    });

    it(`returns file URL when ${entityType} file is POST requested by user with CONTENT_ADMIN role`, async () => {
      const res = await doPresignedUrlRequest(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        testFile.id,
        USER_CONTENT_ADMIN,
        METHOD.POST,
        false
      );
      expect(res._getStatusCode()).toEqual(200);
      const urlInfo = res._getJSONData() as PresignedUrlInfo;
      expectUrlForFile(urlInfo.url, testFile);
    });
  }

  it(`returns error 404 when nonexistent file is POST requested`, async () => {
    expect(
      (
        await doPresignedUrlRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          "09269a6f-9b9b-4b33-b69b-ba2c21b2b8c2",
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it(`returns error 404 when manifest file is POST requested`, async () => {
    expect(
      (
        await doPresignedUrlRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          FILE_MANIFEST_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });
});

async function doPresignedUrlRequest(
  atlasId: string,
  fileId: string,
  user?: TestUser,
  method = METHOD.POST,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, fileId),
  });
  await withConsoleErrorHiding(
    () => presignedUrlHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  fileId: string
): Record<string, string> {
  return { atlasId, fileId };
}

function expectUrlForFile(url: string, testFile: TestFile): void {
  expect(url).toMatch(/^https:\/\//);
  expect(url).toEqual(expect.stringContaining(testFile.fileName));
}
