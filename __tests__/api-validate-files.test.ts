import {
  FILE_TYPE,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { endPgPool, query } from "@/app/services/database";
import { validateAllFiles } from "@/app/services/files";
import validateFilesHandler from "@/pages/api/validate-files";
import {
  getTestApiTokenSubject,
  issueTestApiToken,
} from "@/testing/api-tokens";
import {
  FILE_A_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "@/testing/constants";
import { resetDatabase } from "@/testing/db-utils";
import { type TestFile, type TestUser } from "@/testing/entities";
import {
  getAllTestFiles,
  testApiRole,
  withConsoleErrorHiding,
  withConsoleMessageHiding,
} from "@/testing/utils";
import { type NextApiRequest, type NextApiResponse } from "next";
import httpMocks from "node-mocks-http";

jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");
jest.mock("@/app/services/validator-batch");

jest.mock("next-auth");

const validateMock = validateAllFiles as jest.Mock;

jest.mock("@/app/services/files", () => {
  const filesServices = jest.requireActual<
    typeof import("@/app/services/files")
  >("@/app/services/files");
  return {
    validateAllFiles: jest.fn(filesServices.validateAllFiles),
  };
});

const mockSubmitJob = jest.requireMock<
  typeof import("@/app/services/__mocks__/validator-batch")
>("@/app/services/validator-batch").submitDatasetValidationJob;

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await endPgPool();
});

const TEST_ROUTE = "/api/validate-files";

// Initialize with some hand-selected expected cases
const expectedValidatedTestFiles: TestFile[] = [
  FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
];
const expectedUnvalidatedTestFiles: TestFile[] = [
  FILE_A_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
];

for (const testFile of getAllTestFiles()) {
  if (
    expectedValidatedTestFiles.includes(testFile) ||
    expectedUnvalidatedTestFiles.includes(testFile)
  ) {
    continue;
  }
  const isValidType =
    testFile.fileType === FILE_TYPE.INTEGRATED_OBJECT ||
    testFile.fileType === FILE_TYPE.SOURCE_DATASET;
  if (
    isValidType &&
    testFile.isLatest !== false &&
    testFile.isArchived !== true
  ) {
    expectedValidatedTestFiles.push(testFile);
  } else {
    expectedUnvalidatedTestFiles.push(testFile);
  }
}

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (await doValidateFilesRequest(undefined, METHOD.GET))._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when POST requested by logged out user", async () => {
    expect(
      (
        await doValidateFilesRequest(undefined, METHOD.POST, true)
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when POST requested by unregistered user", async () => {
    expect(
      (
        await doValidateFilesRequest(USER_UNREGISTERED, METHOD.POST, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when POST requested by disabled user", async () => {
    expect(
      (
        await doValidateFilesRequest(USER_DISABLED_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      (...args) => validateFilesHandler(...args),
      METHOD.POST,
      role,
      undefined,
      undefined,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403),
    );
  }

  it("starts validation for all latest-version source dataset and integrated object files when requested by content admin", async () => {
    mockSubmitJob.mockClear();

    await withConsoleMessageHiding(async () => {
      expect(
        (
          await doValidateFilesRequest(USER_CONTENT_ADMIN, METHOD.POST)
        )._getStatusCode(),
      ).toEqual(202);

      await resolveValidate();
    }, true);

    expectAllFilesValidated();
  });

  it("starts validation for all latest-version source dataset and integrated object files when requested with a content admin's API token", async () => {
    mockSubmitJob.mockClear();

    await withConsoleMessageHiding(async () => {
      expect(
        (
          await doValidateFilesRequestWithToken(
            await issueTestApiToken(USER_CONTENT_ADMIN),
          )
        )._getStatusCode(),
      ).toEqual(202);

      await resolveValidate();
    }, true);

    expectAllFilesValidated();
  });

  it("returns error 403 when POST requested with the API token of a user who is no longer a content admin", async () => {
    const token = await issueTestApiToken(USER_CONTENT_ADMIN);
    const { userId } = await getTestApiTokenSubject(USER_CONTENT_ADMIN);
    validateMock.mockClear();
    await query("UPDATE hat.users SET role=$1 WHERE id=$2", [
      ROLE.STAKEHOLDER,
      userId,
    ]);
    try {
      expect(
        (await doValidateFilesRequestWithToken(token, true))._getStatusCode(),
      ).toEqual(403);
    } finally {
      await query("UPDATE hat.users SET role=$1 WHERE id=$2", [
        ROLE.CONTENT_ADMIN,
        userId,
      ]);
    }
    expect(validateMock).not.toHaveBeenCalled();
  });

  it("continues processing files when an error occurs while starting a batch job", async () => {
    mockSubmitJob.mockClear();

    mockSubmitJob.mockImplementationOnce(() => {
      throw new Error("Error starting job");
    });

    await withConsoleMessageHiding(async () => {
      expect(
        (
          await doValidateFilesRequest(USER_CONTENT_ADMIN, METHOD.POST)
        )._getStatusCode(),
      ).toEqual(202);

      await resolveValidate();
    }, true);

    expect(mockSubmitJob).toHaveReturnedTimes(
      expectedValidatedTestFiles.length - 1,
    );
  });
});

async function doValidateFilesRequest(
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { cookie: user?.cookie },
    method,
  });
  await withConsoleErrorHiding(
    () => validateFilesHandler(req, res),
    hideConsoleError,
  );
  return res;
}

async function doValidateFilesRequestWithToken(
  token: string,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: `Bearer ${token}` },
    method: METHOD.POST,
  });
  await withConsoleErrorHiding(
    () => validateFilesHandler(req, res),
    hideConsoleError,
  );
  return res;
}

/**
 * Expects validation jobs to have been submitted for exactly the expected files.
 */
function expectAllFilesValidated(): void {
  expect(mockSubmitJob).toHaveBeenCalledTimes(
    expectedValidatedTestFiles.length,
  );

  for (const testFile of expectedValidatedTestFiles) {
    expect(mockSubmitJob).toHaveBeenCalledWith(
      expect.objectContaining({ fileId: testFile.id }),
    );
  }

  for (const testFile of expectedUnvalidatedTestFiles) {
    expect(mockSubmitJob).not.toHaveBeenCalledWith(
      expect.objectContaining({ fileId: testFile.id }),
    );
  }
}

async function resolveValidate(): Promise<void> {
  await validateMock.mock.results[validateMock.mock.results.length - 1].value;
}
