import {
  createSNSMessage,
  createValidationResults,
  expectDbFileValidationFieldsToMatch,
  setUpAwsConfig,
  SNS_MESSAGE_DEFAULTS,
  SUCCESSFUL_TOOL_REPORTS,
  SUCCESSFUL_VALIDATION_SUMMARY,
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
import {
  DatasetValidatorToolReports,
  SNSMessage,
} from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  FILE_VALIDATION_STATUS,
  FileValidationSummary,
  HCAAtlasTrackerDBFileDatasetInfo,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool } from "../app/services/database";
import {
  COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_BAZ,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOFOO,
} from "../testing/constants";
import { getFileFromDatabase, resetDatabase } from "../testing/db-utils";
import {
  ConsoleMessageOutputArrays,
  fillTestFileDefaults,
  getTestFileKey,
  withConsoleMessageHiding,
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
const FILE_SOURCE_DATASET_BAR = fillTestFileDefaults(SOURCE_DATASET_BAR.file);
const FILE_SOURCE_DATASET_BAZ = fillTestFileDefaults(SOURCE_DATASET_BAZ.file);
const FILE_SOURCE_DATASET_FOOFOO = fillTestFileDefaults(
  SOURCE_DATASET_FOOFOO.file
);

const FILE_COMPONENT_ATLAS_DRAFT_FOO = COMPONENT_ATLAS_DRAFT_FOO.file;

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(`${TEST_ROUTE} (validation results)`, () => {
  it("rejects SNS messages with unparseable JSON in Message field", async () => {
    // Create SNS message with malformed JSON that will fail parsing in service layer
    const messageJson = '{"test": "foo'; // Truncated/invalid JSON
    const malformedSNSMessage: SNSMessage = {
      Message: messageJson,
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

    const errorMessages: unknown[][] = [];

    const res = await doSnsRequest(malformedSNSMessage, true, {
      error: errorMessages,
    });

    // Should reject with 400 Bad Request due to JSON parsing error
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: expect.stringContaining(
        "Failed to parse validation results from SNS message"
      ),
    });

    expect(String(errorMessages[0]?.[0])).toEqual(
      expect.stringContaining(messageJson)
    );
  });

  it("returns error 400 when message content has invalid shape", async () => {
    const fileBefore = await getFileFromDatabase(FILE_SOURCE_DATASET_FOO.id);

    const snsMessageId = "sns-message-invalid-message";
    const snsMessageTime = "2025-09-14T00:00:36.672Z";
    const batchJobId = "batch-job-invalid-message";
    const validationTime = "2025-09-13T22:53:03.314Z";
    const validationResults: Record<string, unknown> = createValidationResults({
      batchJobId,
      fileId: FILE_SOURCE_DATASET_FOO.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_FOO,
        FILE_SOURCE_DATASET_FOO.resolvedAtlas
      ),
      metadata: null,
      timestamp: validationTime,
    });
    // Set metadata_summary to an invalid value
    validationResults.metadata_summary = "not-a-metadata-summary";
    const snsMessage = createSNSMessage({
      message: validationResults,
      messageId: snsMessageId,
      timestamp: snsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    const res = await doSnsRequest(snsMessage, true);
    expect(res.statusCode).toEqual(400);
    expect(res._getJSONData().errors?.metadata_summary).toBeDefined();

    const fileAfter = await getFileFromDatabase(FILE_SOURCE_DATASET_FOO.id);

    expect(fileAfter).toEqual(fileBefore);
  });

  it.each([{ tool: "cap" as const }, { tool: "cellxgene" as const }])(
    "returns error 400 when $tool is missing from tool reports",
    async ({ tool }) => {
      const fileBefore = await getFileFromDatabase(FILE_SOURCE_DATASET_FOO.id);

      const snsMessageId = "sns-message-missing-tool-report";
      const snsMessageTime = "2025-09-23T21:51:48.354Z";
      const batchJobId = "batch-job-missing-tool-report";
      const validationTime = "2025-09-23T21:51:35.241Z";
      const validationResults: Record<string, unknown> =
        createValidationResults({
          batchJobId,
          fileId: FILE_SOURCE_DATASET_FOO.id,
          integrityStatus: INTEGRITY_STATUS.VALID,
          key: getTestFileKey(
            FILE_SOURCE_DATASET_FOO,
            FILE_SOURCE_DATASET_FOO.resolvedAtlas
          ),
          metadata: null,
          timestamp: validationTime,
        });
      // Set tool_reports to have a missing value
      validationResults.tool_reports = {
        ...SUCCESSFUL_TOOL_REPORTS,
        [tool]: undefined,
      };
      const snsMessage = createSNSMessage({
        message: validationResults,
        messageId: snsMessageId,
        timestamp: snsMessageTime,
        topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
      });

      const res = await doSnsRequest(snsMessage, true);
      expect(res.statusCode).toEqual(400);
      expect(res._getJSONData().errors?.[`tool_reports.${tool}`]).toBeDefined();

      const fileAfter = await getFileFromDatabase(FILE_SOURCE_DATASET_FOO.id);

      expect(fileAfter).toEqual(fileBefore);
    }
  );

  it("returns error 409 when validation results are sent with out-of-order timestamps", async () => {
    // First request with later timestamp (2025-09-14)
    const firstSnsMessageId = "sns-message-ooo-first";
    const firstSnsMessageTime = "2025-09-14T12:00:00.000Z";
    const firstBatchJobId = "batch-job-ooo-first";
    const firstValidationTime = "2025-09-14T10:00:00.000Z";
    const firstMetadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-ooo-first"],
      cellCount: 1000,
      disease: ["disease-ooo-first"],
      suspensionType: ["suspension-type-ooo-first"],
      tissue: ["tissue-ooo-first"],
      title: "Out-of-Order First",
    };
    const firstToolReports: DatasetValidatorToolReports = {
      cap: {
        errors: [],
        finished_at: "2025-09-14T10:00:02.342",
        started_at: "2025-09-14T10:00:01.645",
        valid: true,
        warnings: [],
      },
      cellxgene: {
        errors: ["Error OOO first CxG"],
        finished_at: "2025-09-14T10:00:04.342",
        started_at: "2025-09-14T10:00:03.645",
        valid: false,
        warnings: [],
      },
    };
    const firstExpectedValidationSummary: FileValidationSummary = {
      overallValid: false,
      validators: {
        cap: true,
        cellxgene: false,
      },
    };
    const firstValidationResults = createValidationResults({
      batchJobId: firstBatchJobId,
      fileId: FILE_SOURCE_DATASET_BAR.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_BAR,
        FILE_SOURCE_DATASET_BAR.resolvedAtlas
      ),
      metadata: firstMetadata,
      timestamp: firstValidationTime,
      toolReports: firstToolReports,
    });
    const firstSnsMessage = createSNSMessage({
      message: firstValidationResults,
      messageId: firstSnsMessageId,
      timestamp: firstSnsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    // Send first request - should succeed
    expect((await doSnsRequest(firstSnsMessage, true)).statusCode).toEqual(200);

    // Second request with earlier timestamp (2025-09-13) - should fail with 409
    const secondSnsMessageId = "sns-message-ooo-second";
    const secondSnsMessageTime = "2025-09-13T12:00:00.000Z";
    const secondBatchJobId = "batch-job-ooo-second";
    const secondValidationTime = "2025-09-13T10:00:00.000Z"; // Earlier than first
    const secondMetadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-ooo-second"],
      cellCount: 2000,
      disease: ["disease-ooo-second"],
      suspensionType: ["suspension-type-ooo-second"],
      tissue: ["tissue-ooo-second"],
      title: "Out-of-Order Second",
    };
    const secondValidationResults = createValidationResults({
      batchJobId: secondBatchJobId,
      fileId: FILE_SOURCE_DATASET_BAR.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_BAR,
        FILE_SOURCE_DATASET_BAR.resolvedAtlas
      ),
      metadata: secondMetadata,
      timestamp: secondValidationTime,
    });
    const secondSnsMessage = createSNSMessage({
      message: secondValidationResults,
      messageId: secondSnsMessageId,
      timestamp: secondSnsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    // Send second request - should return 409 due to out-of-order timestamp
    const res = await doSnsRequest(secondSnsMessage, true);
    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toEqual({
      message: `Newer validation results already exist for file with ID ${FILE_SOURCE_DATASET_BAR.id}`,
    });

    // Verify the file still has the first validation results (not overwritten)
    await expectDbFileValidationFieldsToMatch(
      FILE_SOURCE_DATASET_BAR.id,
      firstValidationTime,
      INTEGRITY_STATUS.VALID,
      firstMetadata,
      {
        batchJobId: firstBatchJobId,
        snsMessageId: firstSnsMessageId,
        snsMessageTime: firstSnsMessageTime,
      },
      firstToolReports,
      firstExpectedValidationSummary
    );
  });

  it("successfully saves validation results for dataset file", async () => {
    const snsMessageId = "sns-message-dataset-successful";
    const snsMessageTime = "2025-09-14T00:00:36.672Z";
    const batchJobId = "batch-job-dataset-successful";
    const validationTime = "2025-09-13T22:53:03.314Z";
    const metadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-dataset-successful-a", "assay-dataset-successful-b"],
      cellCount: 2232,
      disease: ["disease-dataset-successful"],
      suspensionType: ["suspension-type-dataset-successful"],
      tissue: ["tissue-dataset-successful"],
      title: "Dataset Successful",
    };
    const toolReports: DatasetValidatorToolReports = {
      cap: {
        errors: ["Error dataset successful CAP"],
        finished_at: validationTime,
        started_at: validationTime,
        valid: false,
        warnings: [],
      },
      cellxgene: {
        errors: ["Error dataset successful CxG"],
        finished_at: validationTime,
        started_at: validationTime,
        valid: false,
        warnings: ["Warning dataset successful CxG"],
      },
    };
    const expectedValidationSummary: FileValidationSummary = {
      overallValid: false,
      validators: {
        cap: false,
        cellxgene: false,
      },
    };
    const validationResults = createValidationResults({
      batchJobId,
      fileId: FILE_SOURCE_DATASET_FOO.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_FOO,
        FILE_SOURCE_DATASET_FOO.resolvedAtlas
      ),
      metadata,
      timestamp: validationTime,
      toolReports,
    });
    const snsMessage = createSNSMessage({
      message: validationResults,
      messageId: snsMessageId,
      timestamp: snsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    expect((await doSnsRequest(snsMessage, true)).statusCode).toEqual(200);

    await expectDbFileValidationFieldsToMatch(
      FILE_SOURCE_DATASET_FOO.id,
      validationTime,
      INTEGRITY_STATUS.VALID,
      metadata,
      {
        batchJobId,
        snsMessageId,
        snsMessageTime,
      },
      toolReports,
      expectedValidationSummary
    );
  });

  it("successfully saves validation results for integrated object file", async () => {
    const snsMessageId = "sns-message-io-successful";
    const snsMessageTime = "2025-09-14T01:05:55.532Z";
    const batchJobId = "batch-job-io-successful";
    const validationTime = "2025-09-14T01:05:37.734Z";
    const metadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-io-successful", "assay-io-successful"],
      cellCount: 53453,
      disease: ["disease-io-successful-a", "disease-io-successful-b"],
      suspensionType: ["suspension-type-io-successful"],
      tissue: [
        "tissue-io-successful-a",
        "tissue-io-successful-b",
        "tissue-io-successful-c",
      ],
      title: "Integrated Object Successful",
    };
    const toolReports: DatasetValidatorToolReports = {
      cap: {
        errors: ["Error IO successful CAP"],
        finished_at: validationTime,
        started_at: validationTime,
        valid: false,
        warnings: [],
      },
      cellxgene: {
        errors: ["Error IO successful CxG"],
        finished_at: validationTime,
        started_at: validationTime,
        valid: false,
        warnings: ["Warning IO successful CxG"],
      },
    };
    const expectedValidationSummary: FileValidationSummary = {
      overallValid: false,
      validators: {
        cap: false,
        cellxgene: false,
      },
    };
    const validationResults = createValidationResults({
      batchJobId,
      fileId: FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_COMPONENT_ATLAS_DRAFT_FOO,
        FILE_COMPONENT_ATLAS_DRAFT_FOO.atlas
      ),
      metadata,
      timestamp: validationTime,
      toolReports,
    });
    const snsMessage = createSNSMessage({
      message: validationResults,
      messageId: snsMessageId,
      timestamp: snsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    expect((await doSnsRequest(snsMessage, true)).statusCode).toEqual(200);

    await expectDbFileValidationFieldsToMatch(
      FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
      validationTime,
      INTEGRITY_STATUS.VALID,
      metadata,
      {
        batchJobId,
        snsMessageId,
        snsMessageTime,
      },
      toolReports,
      expectedValidationSummary
    );
  });

  it("successfully saves validation results from duplicate notification", async () => {
    const snsMessageId = "sns-message-duplicate";
    const snsMessageTime = "2025-09-14T01:10:45.293Z";
    const batchJobId = "batch-job-duplicate";
    const validationTime = "2025-09-14T01:10:31.843Z";
    const metadata: HCAAtlasTrackerDBFileDatasetInfo = {
      assay: ["assay-duplicate-a", "assay-duplicate-b", "assay-duplicate-b"],
      cellCount: 12314,
      disease: ["disease-duplicate"],
      suspensionType: [
        "suspension-type-duplicate-a",
        "suspension-type-duplicate-b",
      ],
      tissue: ["tissue-duplicate"],
      title: "Duplicate",
    };
    const validationResults = createValidationResults({
      batchJobId,
      fileId: FILE_SOURCE_DATASET_BAZ.id,
      integrityStatus: INTEGRITY_STATUS.VALID,
      key: getTestFileKey(
        FILE_SOURCE_DATASET_BAZ,
        FILE_SOURCE_DATASET_BAZ.resolvedAtlas
      ),
      metadata,
      timestamp: validationTime,
    });
    const snsMessage = createSNSMessage({
      message: validationResults,
      messageId: snsMessageId,
      timestamp: snsMessageTime,
      topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
    });

    // Expect initial request to be successful

    expect((await doSnsRequest(snsMessage, true)).statusCode).toEqual(200);

    await expectDbFileValidationFieldsToMatch(
      FILE_SOURCE_DATASET_BAZ.id,
      validationTime,
      INTEGRITY_STATUS.VALID,
      metadata,
      {
        batchJobId,
        snsMessageId,
        snsMessageTime,
      },
      SUCCESSFUL_TOOL_REPORTS,
      SUCCESSFUL_VALIDATION_SUMMARY
    );

    // Expect second, duplicate request to be successful

    expect((await doSnsRequest(snsMessage, true)).statusCode).toEqual(200);

    await expectDbFileValidationFieldsToMatch(
      FILE_SOURCE_DATASET_BAZ.id,
      validationTime,
      INTEGRITY_STATUS.VALID,
      metadata,
      {
        batchJobId,
        snsMessageId,
        snsMessageTime,
      },
      SUCCESSFUL_TOOL_REPORTS,
      SUCCESSFUL_VALIDATION_SUMMARY
    );
  });

  it.each([
    {
      expectedValidationStatus: FILE_VALIDATION_STATUS.COMPLETED,
      messageIntegrityStatus: INTEGRITY_STATUS.VALID,
      messageStatus: "success" as const,
      time: "2025-09-19T07:49:49.053Z",
    },
    {
      expectedValidationStatus: FILE_VALIDATION_STATUS.COMPLETED,
      messageIntegrityStatus: INTEGRITY_STATUS.INVALID,
      messageStatus: "failure" as const,
      time: "2025-09-19T07:50:03.633Z",
    },
    {
      expectedValidationStatus: FILE_VALIDATION_STATUS.JOB_FAILED,
      messageIntegrityStatus: INTEGRITY_STATUS.ERROR,
      messageStatus: "failure" as const,
      time: "2025-09-19T07:52:32.720Z",
    },
    {
      expectedValidationStatus: FILE_VALIDATION_STATUS.JOB_FAILED,
      messageIntegrityStatus: null,
      messageStatus: "failure" as const,
      time: "2025-09-19T07:52:43.908Z",
    },
  ])(
    "saves correct validation status for status $messageStatus and integrity status $messageIntegrityStatus",
    async ({
      expectedValidationStatus,
      messageIntegrityStatus,
      messageStatus,
      time,
    }) => {
      const snsMessageId = "sns-message-validation-statuses";
      const batchJobId = "batch-job-validation-statuses";
      const validationResults = createValidationResults({
        batchJobId,
        fileId: FILE_SOURCE_DATASET_FOOFOO.id,
        integrityStatus: messageIntegrityStatus,
        key: getTestFileKey(
          FILE_SOURCE_DATASET_FOOFOO,
          FILE_SOURCE_DATASET_FOOFOO.resolvedAtlas
        ),
        metadata: null,
        status: messageStatus,
        timestamp: time,
      });
      const snsMessage = createSNSMessage({
        message: validationResults,
        messageId: snsMessageId,
        timestamp: time,
        topicArn: TEST_SNS_TOPIC_VALIDATION_RESULTS,
      });

      expect((await doSnsRequest(snsMessage, true)).statusCode).toEqual(200);

      expect(
        (await getFileFromDatabase(FILE_SOURCE_DATASET_FOOFOO.id))
          ?.validation_status
      ).toEqual(expectedValidationStatus);
    }
  );
});

async function doSnsRequest(
  body: Record<string, unknown>,
  hideConsoleMessages = false,
  consoleMessageOutputArrays?: ConsoleMessageOutputArrays
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    method: METHOD.POST,
  });
  await withConsoleMessageHiding(
    () => snsHandler(req, res),
    hideConsoleMessages,
    consoleMessageOutputArrays
  );
  return res;
}
