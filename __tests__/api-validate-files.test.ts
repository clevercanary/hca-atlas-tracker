import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { resetDatabase } from "testing/db-utils";
import { FILE_TYPE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { validateAllFiles } from "../app/services/files";
import validateFilesHandler from "../pages/api/validate-files";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestFile, TestUser } from "../testing/entities";
import {
  getAllTestFiles,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/validator-batch");

jest.mock("next-auth");

const validateMock = validateAllFiles as jest.Mock;

jest.mock("../app/services/files", () => {
  const filesServices = jest.requireActual<
    typeof import("../app/services/files")
  >("../app/services/files");
  return {
    validateAllFiles: jest.fn(filesServices.validateAllFiles),
  };
});

const mockSubmitJob = jest.requireMock<
  typeof import("../app/services/__mocks__/validator-batch")
>("../app/services/validator-batch").submitDatasetValidationJob;

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

const TEST_ROUTE = "/api/validate-files";

const expectedValidatedTestFiles: TestFile[] = [];
const expectedUnvalidatedTestFiles: TestFile[] = [];

for (const testFile of getAllTestFiles()) {
  const isValidType =
    testFile.fileType === FILE_TYPE.INTEGRATED_OBJECT ||
    testFile.fileType === FILE_TYPE.SOURCE_DATASET;
  if (isValidType && testFile.isLatest !== false) {
    expectedValidatedTestFiles.push(testFile);
  } else {
    expectedUnvalidatedTestFiles.push(testFile);
  }
}

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (await doValidateFilesRequest(undefined, METHOD.GET))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when POST requested by logged out user", async () => {
    expect(
      (
        await doValidateFilesRequest(undefined, METHOD.POST, true)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when POST requested by unregistered user", async () => {
    expect(
      (
        await doValidateFilesRequest(USER_UNREGISTERED, METHOD.POST, true)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when POST requested by disabled user", async () => {
    expect(
      (
        await doValidateFilesRequest(USER_DISABLED_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode()
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
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("starts validation for all latest-version source dataset and integrated object files when requested by content admin", async () => {
    mockSubmitJob.mockClear();

    expect(
      (
        await doValidateFilesRequest(USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode()
    ).toEqual(202);

    await resolveValidate();

    expect(mockSubmitJob).toHaveBeenCalledTimes(
      expectedValidatedTestFiles.length
    );

    for (const testFile of expectedValidatedTestFiles) {
      expect(mockSubmitJob).toHaveBeenCalledWith(
        expect.objectContaining({ fileId: testFile.id })
      );
    }

    for (const testFile of expectedUnvalidatedTestFiles) {
      expect(mockSubmitJob).not.toHaveBeenCalledWith(
        expect.objectContaining({ fileId: testFile.id })
      );
    }
  });

  it("continues processing files when an error occurs while starting a batch job", async () => {
    mockSubmitJob.mockClear();

    mockSubmitJob.mockImplementationOnce(() => {
      throw new Error("Error starting job");
    });

    expect(
      (
        await doValidateFilesRequest(USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode()
    ).toEqual(202);

    await resolveValidate();

    expect(mockSubmitJob).toHaveReturnedTimes(
      expectedValidatedTestFiles.length - 1
    );
  });
});

async function doValidateFilesRequest(
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => validateFilesHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function resolveValidate(): Promise<void> {
  await validateMock.mock.results[validateMock.mock.results.length - 1].value;
}
