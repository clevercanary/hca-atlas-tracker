import {
  createSNSMessage,
  createValidationResults,
  setUpAwsConfig,
  SNS_MESSAGE_DEFAULTS,
  TEST_SIGNATURE_VALID,
  TEST_SNS_TOPIC_VALIDATION_RESULTS,
  TEST_TIMESTAMP,
  validateTestSnsMessage,
} from "../testing/sns-testing";

// Set up AWS resource configuration BEFORE any other imports
setUpAwsConfig();

// Imports
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { SNSMessage } from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  HCAAtlasTrackerDBFileDatasetInfo,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool } from "../app/services/database";
import { SOURCE_DATASET_FOO } from "../testing/constants";
import { getFileFromDatabase, resetDatabase } from "../testing/db-utils";
import {
  expectIsDefined,
  fillTestFileDefaults,
  getTestFileKey,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

afterEach(() => {
  resetConfigCache();
});

jest.mock("sns-validator", () => {
  return jest.fn().mockImplementation(() => ({
    validate: jest.fn(validateTestSnsMessage),
  }));
});

const TEST_ROUTE = "/api/sns";

import snsHandler from "../pages/api/sns";

const FILE_SOURCE_DATASET_FOO = fillTestFileDefaults(SOURCE_DATASET_FOO.file);

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(`${TEST_ROUTE} (validation results)`, () => {
  it("rejects SNS messages with unparseable JSON in Message field", async () => {
    // Create SNS message with malformed JSON that will fail parsing in service layer
    const malformedSNSMessage: SNSMessage = {
      Message: "{", // Truncated/invalid JSON
      MessageId: "malformed-json-test",
      Signature: TEST_SIGNATURE_VALID,
      SignatureVersion: "1",
      SigningCertURL:
        "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
      Subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      Timestamp: TEST_TIMESTAMP,
      TopicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
      Type: "Notification",
    };

    const res = await doSnsRequest(malformedSNSMessage);

    // Should reject with 400 Bad Request due to JSON parsing error
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: "Failed to parse validation results from SNS message",
    });
  });

  it("successfully saves validation results for dataset file", async () => {
    const timestamp = "2025-09-13T22:53:03.314Z";
    const metadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-dataset-successful-a", "assay-dataset-successful-b"],
      cellCount: 2232,
      disease: ["disease-dataset-successful"],
      suspensionType: ["suspension-dataset-type-successful"],
      tissue: ["tissue-dataset-successful"],
      title: "Dataset Successful",
    };
    const validationResults = createValidationResults({
      fileId: FILE_SOURCE_DATASET_FOO.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_FOO,
        FILE_SOURCE_DATASET_FOO.resolvedAtlas
      ),
      metadata,
      timestamp,
    });
    const snsMessage = createSNSMessage({
      message: validationResults,
      messageId: "test-message-successful",
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    expect((await doSnsRequest(snsMessage)).statusCode).toEqual(200);

    const file = await getFileFromDatabase(FILE_SOURCE_DATASET_FOO.id);
    if (!expectIsDefined(file)) return;

    expect(file.dataset_info).toEqual(metadata);
    expect(file.integrity_checked_at?.toISOString()).toEqual(timestamp);
    expect(file.integrity_status).toEqual(INTEGRITY_STATUS.VALID);
  });
});

async function doSnsRequest(
  body: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    method: METHOD.POST,
  });
  await withConsoleErrorHiding(() => snsHandler(req, res), hideConsoleError);
  return res;
}
