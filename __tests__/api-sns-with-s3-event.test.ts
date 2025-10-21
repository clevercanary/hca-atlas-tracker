import {
  createS3Event,
  createSNSMessage,
  createTestAtlasData,
  setUpAwsConfig,
  SNS_MESSAGE_DEFAULTS,
  SQL_QUERIES,
  TEST_AWS_CONFIG,
  TEST_FILE_PATHS,
  TEST_GUT_ATLAS_ID,
  TEST_MODULE_SNS_VALIDATOR,
  TEST_S3_BUCKET,
  TEST_S3_EVENT_NAME_OBJECT_CREATED,
  TEST_SIGNATURE,
  TEST_SIGNATURE_VALID,
  TEST_SIGNATURE_VALID_FOR_TESTING,
  TEST_TIMESTAMP,
  TEST_TIMESTAMP_ALT,
  TEST_TIMESTAMP_PLUS_1H,
  TEST_VERSION_IDS,
  validateTestSnsMessage,
} from "../testing/sns-testing";

// Set up AWS resource configuration BEFORE any other imports
setUpAwsConfig();

// Imports
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { SNSMessage } from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerDBFile,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool, query } from "../app/services/database";
import {
  countComponentAtlases,
  countSourceDatasets,
  resetDatabase,
} from "../testing/db-utils";
import { withConsoleMessageHiding } from "../testing/utils";

// Additional imports for direct service testing
import { updateSourceDataset } from "../app/services/s3-notification";
import { InvalidOperationError } from "../app/utils/api-handler";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/validator-batch");

jest.mock("next-auth");

// (Removed ky mock) Using http wrapper mock at top of file instead

afterEach(() => {
  resetConfigCache();
});

jest.mock("sns-validator", () => {
  return jest.fn().mockImplementation(() => ({
    validate: jest.fn(validateTestSnsMessage),
  }));
});

const mockSubmitJob = jest.requireMock<
  typeof import("../app/services/__mocks__/validator-batch")
>("../app/services/validator-batch").submitDatasetValidationJob;

const TEST_ROUTE = "/api/sns";

import snsHandler from "../pages/api/sns";

beforeEach(async () => {
  await resetDatabase();
  await createTestAtlasData();
});

afterAll(() => {
  endPgPool();
});

describe(`${TEST_ROUTE} (S3 event)`, () => {
  it("rejects S3 record when eventTime is missing", async () => {
    // Start with a valid event and then remove eventTime to simulate missing timestamp
    const s3Event = createS3Event({
      etag: "missing-event-time-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      key: TEST_FILE_PATHS.SOURCE_DATASET_TEST,
      size: 1234,
      versionId: "missing-event-time-version",
    });

    // Remove eventTime to simulate missing value in the incoming event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mutates mock to drop eventTime
    delete (s3Event as any).Records[0].eventTime;

    const snsMessage = createSNSMessage({
      messageId: "missing-event-time-message-id",
      s3Event,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    // Should reject with 400 due to schema validation (missing required eventTime)
    expect(res.statusCode).toBe(400);

    // Verify that no file was written to the database for this key
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_TEST]
    );
    expect(fileRows.rows).toHaveLength(0);
  });

  // SHA256 Integrity Validation Tests
  test("successfully processes S3 event without SHA256 metadata", async () => {
    const s3Event = createS3Event({
      etag: "d41d8cd98f00b204e9800998ecf8427e",
      key: TEST_FILE_PATHS.SOURCE_DATASET_TEST,
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "12345678-1234-1234-1234-123456789012",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved to database with NULL SHA256
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_TEST]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.sha256_client).toBeNull(); // Should be NULL since no SHA256 provided
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.REQUESTED);
  });

  it("clears sd_info on source_dataset update while preserving is_latest", async () => {
    // First upload (creates source dataset and file record)
    const firstEvent = createS3Event({
      etag: "sd-v1-etag-11111111111111111111111111111111",
      eventTime: TEST_TIMESTAMP, // older
      key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      size: 12345,
      versionId: "sd-version-1",
    });

    const firstMessage = createSNSMessage({
      messageId: "sd-update-test-v1",
      s3Event: firstEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: firstMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Capture the created source dataset id before update
    const sdBefore = await query(
      "SELECT source_dataset_id AS id FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true",
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED]
    );
    expect(sdBefore.rows).toHaveLength(1);
    const sourceDatasetId: string = sdBefore.rows[0].id;

    // Ensure first file is marked latest
    const firstFile = await query(
      SQL_QUERIES.SELECT_LATEST_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED]
    );
    expect(firstFile.rows).toHaveLength(1);
    expect(firstFile.rows[0].is_latest).toBe(true);

    // Second upload (update) with newer eventTime
    const secondEvent = createS3Event({
      etag: "sd-v2-etag-22222222222222222222222222222222",
      eventTime: TEST_TIMESTAMP_PLUS_1H, // newer
      key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      size: 23456,
      versionId: "sd-version-2",
    });

    const secondMessage = createSNSMessage({
      messageId: "sd-update-test-v2",
      s3Event: secondEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: secondMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Verify sd_info is cleared on the linked source dataset
    const sdAfter = await query(
      "SELECT sd_info FROM hat.source_datasets WHERE id = $1",
      [sourceDatasetId]
    );
    expect(sdAfter.rows).toHaveLength(1);
    expect(sdAfter.rows[0].sd_info).toEqual({
      assay: [],
      cellCount: 0,
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
      cellxgeneExplorerUrl: null,
      disease: [],
      metadataSpreadsheetTitle: null,
      metadataSpreadsheetUrl: null,
      suspensionType: [],
      tissue: [],
      title: "versioned-file",
    });

    // Verify file versioning flags: latest remains true on newest, previous false
    const versions = await query(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED]
    );
    expect(versions.rows).toHaveLength(2);
    expect(versions.rows[0].is_latest).toBe(false); // older
    expect(versions.rows[1].is_latest).toBe(true); // newer
  });

  it("updateSourceDataset throws when metadataObjectId is missing", async () => {
    await expect(
      updateSourceDataset(
        TEST_GUT_ATLAS_ID,
        {
          eTag: "abc",
          key: TEST_FILE_PATHS.SOURCE_DATASET_TEST,
          size: 123,
          versionId: "xyz",
        },
        null,
        {} as unknown as import("pg").PoolClient
      )
    ).rejects.toThrow(InvalidOperationError);
  });

  // Happy Path Processing Tests
  it("successfully processes valid SNS notification with S3 ObjectCreated event", async () => {
    const s3Event = createS3Event({
      etag: "d41d8cd98f00b204e9800998ecf8427e",
      key: TEST_FILE_PATHS.SOURCE_DATASET_TEST,
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "12345678-1234-1234-1234-123456789012",
      s3Event,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved to database
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_TEST]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.SOURCE_DATASET_TEST);
    expect(file.etag).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(file.size_bytes).toBe("1024000"); // PostgreSQL bigint returns as string
    expect(file.version_id).toBe(TEST_VERSION_IDS.DEFAULT);
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.REQUESTED);
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.REQUESTED);
    expect(file.sha256_server).toBeNull();
    expect(file.integrity_checked_at).toBeNull();
    expect(file.integrity_error).toBeNull();
    expect(file.file_type).toBe(FILE_TYPE.SOURCE_DATASET); // New field - should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation

    // Verify source dataset was created and linked to atlas
    const sourceDatasetRows = await query(
      "SELECT DISTINCT source_dataset_id AS id FROM hat.files WHERE bucket = $1 AND key = $2",
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_TEST]
    );
    expect(sourceDatasetRows.rows).toHaveLength(1);
    const sourceDatasetId = sourceDatasetRows.rows[0].id;

    // Verify atlas has the source dataset in its source_datasets array
    const atlasRows = await query(
      "SELECT source_datasets FROM hat.atlases WHERE id = $1",
      [TEST_GUT_ATLAS_ID]
    );
    expect(atlasRows.rows).toHaveLength(1);
    expect(atlasRows.rows[0].source_datasets).toContain(sourceDatasetId);
  });

  test("rejects SNS messages with unparseable JSON in Message field", async () => {
    // Create SNS message with malformed JSON that will fail parsing in service layer
    const messageJson =
      '{ "Records": [ { "eventName": "s3:ObjectCreated:Put", "invalid": }'; // Truncated/invalid JSON
    const malformedSNSMessage: SNSMessage = {
      Message: messageJson,
      MessageId: "malformed-json-test",
      Signature: TEST_SIGNATURE_VALID,
      SignatureVersion: "1",
      SigningCertURL:
        "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
      Subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      Timestamp: TEST_TIMESTAMP,
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
      Type: "Notification",
    };

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: malformedSNSMessage,
        method: "POST",
      }
    );

    // Mock SNS validator to pass signature validation but preserve malformed JSON
    const mockValidate = jest.fn((message, callback) => {
      callback(null, message); // Pass through the malformed message
    });
    jest.doMock(TEST_MODULE_SNS_VALIDATOR, () => ({
      MessageValidator: jest.fn(() => ({
        validate: mockValidate,
      })),
    }));

    const { default: snsHandler } = await import("../pages/api/sns");

    const errorMessages: unknown[][] = [];

    await withConsoleMessageHiding(
      async () => {
        await snsHandler(req, res);
      },
      true,
      { error: errorMessages }
    );

    // Should reject with 400 Bad Request due to JSON parsing error
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: expect.stringContaining(
        "Failed to parse S3 event from SNS message"
      ),
    });

    expect(String(errorMessages[0]?.[0])).toEqual(
      expect.stringContaining(messageJson)
    );
  });

  // Idempotency and Data Integrity Tests
  it("handles duplicate notifications idempotently", async () => {
    const s3Event = createS3Event({
      etag: "e1234567890abcdef1234567890abcdef",
      key: TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE,
      size: 2048000,
      versionId: "abc123def456ghi789jkl012mno345pqr",
    });

    const snsMessage = createSNSMessage({
      messageId: "duplicate-test-message",
      s3Event,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage,
      method: METHOD.POST,
    });

    // First request
    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage,
      method: METHOD.POST,
    });

    // Second request with same data
    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Should still only have one record
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.file_type).toBe("source_dataset"); // Should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation
  });

  it("rejects replay with same SNS MessageId but altered ETag", async () => {
    // First notification inserts the record
    const s3Event1 = createS3Event({
      etag: "original-replay-etag-11111111111111111111111111111111",
      key: TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
      size: 128000,
      versionId: "replay-version-1",
    });

    const messageId = "replay-same-id-message";

    const snsMessage1 = createSNSMessage({
      messageId,
      s3Event: s3Event1,
      signature: TEST_SIGNATURE_VALID_FOR_TESTING,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage1,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Replay with the SAME MessageId but tampered ETag should be rejected
    const s3Event2 = createS3Event({
      etag: "tampered-replay-etag-22222222222222222222222222222222", // different ETag
      key: TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
      size: 128000,
      versionId: "replay-version-1", // same version
    });

    const snsMessage2 = createSNSMessage({
      messageId, // same MessageId as first message
      s3Event: s3Event2,
      signature: TEST_SIGNATURE_VALID_FOR_TESTING,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage2,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });

    // Should reject with 409 Conflict due to ETag mismatch during replay (triggers SNS retry/DLQ)
    expect(res2.statusCode).toBe(409);
    const responseBody = JSON.parse(res2._getData());
    expect(responseBody.message).toContain("ETag mismatch");
    expect(responseBody.message).toContain(
      "existing=original-replay-etag-11111111111111111111111111111111"
    );
    expect(responseBody.message).toContain(
      "new=tampered-replay-etag-22222222222222222222222222222222"
    );

    // Verify only one record exists and it remains the original
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_ETAG]
    );
    expect(fileRows.rows).toHaveLength(1);
    expect(fileRows.rows[0].etag).toBe(
      "original-replay-etag-11111111111111111111111111111111"
    );
  });

  it("rejects notifications with ETag mismatches for existing files", async () => {
    const s3Event = createS3Event({
      etag: "original-etag-12345",
      eventTime: TEST_TIMESTAMP_ALT,
      key: TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
      size: 128000,
      versionId: "version-123",
    });

    const snsMessage = createSNSMessage({
      messageId: "etag-test-message-1",
      s3Event,
      signature: TEST_SIGNATURE_VALID_FOR_TESTING,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    // First notification - should succeed
    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage,
      method: "POST",
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Second notification with different ETag - should be rejected
    const s3EventWithDifferentETag = createS3Event({
      etag: "different-etag-67890", // Different ETag!
      eventTime: TEST_TIMESTAMP_ALT,
      key: TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
      size: 128000,
      versionId: "version-123",
    });

    const snsMessageWithDifferentETag = createSNSMessage({
      messageId: "etag-test-message-2",
      s3Event: s3EventWithDifferentETag,
      signature: TEST_SIGNATURE_VALID_FOR_TESTING,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageWithDifferentETag,
      method: "POST",
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });

    // Should reject with 409 Conflict due to ETag mismatch
    expect(res2.statusCode).toBe(409);
    const responseBody = JSON.parse(res2._getData());
    expect(responseBody.message).toContain("ETag mismatch");
    expect(responseBody.message).toContain("existing=original-etag-12345");
    expect(responseBody.message).toContain("new=different-etag-67890");

    // Verify only one record exists with original ETag
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_ETAG]
    );

    expect(fileRows.rows).toHaveLength(1);
    expect(fileRows.rows[0].etag).toBe("original-etag-12345");
  });

  it.each([
    { folder: "source-datasets" },
    { folder: "integrated-objects" },
    { folder: "manifests" },
  ])("does not save file under $folder named .keep", async ({ folder }) => {
    mockSubmitJob.mockClear();

    const key = `gut/gut-v1/${folder}/.keep`;

    const s3Event = createS3Event({
      etag: `${folder}-keep-etag-12345678901234567890123456789012`,
      key,
      size: 2342356,
      versionId: "keep-version-1",
    });

    const snsMessage = createSNSMessage({
      messageId: `${folder}-keep-test-message`,
      s3Event,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that the dataset validator was not called
    expect(mockSubmitJob).not.toHaveBeenCalled();

    // Check that no file was saved to the database
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, key]
    );

    expect(fileRows.rows).toHaveLength(0);
  });

  // File Versioning Tests
  it("maintains is_latest flag correctly for file versions", async () => {
    // First version of the file
    const s3EventV1 = createS3Event({
      etag: "version1-etag-12345678901234567890123456789012",
      eventTime: "2024-01-01T12:00:00.000Z",
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 1024000,
      versionId: "version-1",
    });

    const snsMessageV1 = createSNSMessage({
      messageId: "test-message-id-v1",
      s3Event: s3EventV1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV1,
      method: "POST",
    });

    // Process first version
    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Second version of the same file (different version_id and etag)
    const s3EventV2 = createS3Event({
      etag: "version2-etag-98765432109876543210987654321098",
      eventTime: TEST_TIMESTAMP_PLUS_1H,
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT, // Same key
      size: 2048000,
      versionId: "version-2", // Different version
    });

    const snsMessageV2 = createSNSMessage({
      messageId: "test-message-id-v2",
      s3Event: s3EventV2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV2,
      method: "POST",
    });

    // Process second version
    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Check database state - should have 2 records for the same file
    const allVersions = await query(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    expect(allVersions.rows).toHaveLength(2);

    // First version should NOT be latest
    const firstVersion = allVersions.rows[0];
    expect(firstVersion.version_id).toBe("version-1");
    expect(firstVersion.is_latest).toBe(false);

    // Second version should BE latest
    const secondVersion = allVersions.rows[1];
    expect(secondVersion.version_id).toBe("version-2");
    expect(secondVersion.is_latest).toBe(true);
  });

  it("sets is_latest and is_archived as normal when existing latest file has archived = true", async () => {
    // First version of the file
    const s3EventV1 = createS3Event({
      etag: "version1-etag-12345678901234567890123456789012",
      eventTime: "2024-01-01T12:00:00.000Z",
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 1024000,
      versionId: "version-1",
    });

    const snsMessageV1 = createSNSMessage({
      messageId: "test-message-id-v1",
      s3Event: s3EventV1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV1,
      method: "POST",
    });

    // Process first version
    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    const {
      rows: [firstVersionBefore],
    } = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    // Set is_archived to true
    await query("UPDATE hat.files SET is_archived=TRUE WHERE id=$1", [
      firstVersionBefore.id,
    ]);

    // Second version of the same file (different version_id and etag)
    const s3EventV2 = createS3Event({
      etag: "version2-etag-98765432109876543210987654321098",
      eventTime: TEST_TIMESTAMP_PLUS_1H,
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT, // Same key
      size: 2048000,
      versionId: "version-2", // Different version
    });

    const snsMessageV2 = createSNSMessage({
      messageId: "test-message-id-v2",
      s3Event: s3EventV2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV2,
      method: "POST",
    });

    // Process second version
    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Check database state - should have 2 records for the same file
    const allVersions = await query(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    expect(allVersions.rows).toHaveLength(2);

    // First version should NOT be latest and should BE archived
    const firstVersion = allVersions.rows[0];
    expect(firstVersion.version_id).toBe("version-1");
    expect(firstVersion.is_latest).toBe(false);
    expect(firstVersion.is_archived).toBe(true);

    // Second version should BE latest and should NOT be archived
    const secondVersion = allVersions.rows[1];
    expect(secondVersion.version_id).toBe("version-2");
    expect(secondVersion.is_latest).toBe(true);
    expect(secondVersion.is_archived).toBe(false);
  });

  it("does not flip is_latest when older version arrives after newer version", async () => {
    // Process newer version first
    const s3EventV2 = createS3Event({
      etag: "ooo-version2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      eventTime: TEST_TIMESTAMP_PLUS_1H,
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 2048000,
      versionId: "ooo-version-2",
    });

    const snsMessageV2 = createSNSMessage({
      messageId: "out-of-order-v2",
      s3Event: s3EventV2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    const { req: reqNewer, res: resNewer } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV2,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(reqNewer, resNewer);
    });
    expect(resNewer.statusCode).toBe(200);

    // Now process an older version afterwards (out-of-order arrival)
    const s3EventV1 = createS3Event({
      etag: "ooo-version1-etag-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      eventTime: TEST_TIMESTAMP, // earlier than V2
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 1024000,
      versionId: "ooo-version-1",
    });

    const snsMessageV1 = createSNSMessage({
      messageId: "out-of-order-v1",
      s3Event: s3EventV1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: reqOlder, res: resOlder } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV1,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(reqOlder, resOlder);
    });
    expect(resOlder.statusCode).toBe(200);

    // Expect two versions exist for this key
    const allRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );
    expect(allRows.rows).toHaveLength(2);

    // Latest should remain the newer (V2), not be flipped by the older V1 arrival
    const latestOnly = await query(
      SQL_QUERIES.SELECT_LATEST_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );
    expect(latestOnly.rows).toHaveLength(1);
    expect(latestOnly.rows[0].version_id).toBe("ooo-version-2");
    expect(latestOnly.rows[0].etag).toBe(
      "ooo-version2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
  });

  it("rejects notifications from unauthorized S3 buckets", async () => {
    const s3Event = createS3Event({
      bucket: "unauthorized-bucket",
      etag: "d41d8cd98f00b204e9800998ecf8427e",
      key: "test-file.h5ad",
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "unauthorized-bucket-test",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: "POST",
      }
    );

    const handler = (await import("../pages/api/sns")).default;
    await withConsoleMessageHiding(async () => {
      await handler(req, res);
    });

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Unauthorized S3 bucket: unauthorized-bucket",
    });
  });

  // File Classification and Atlas Lookup Tests
  it("correctly identifies integrated object file type from S3 path", async () => {
    const s3Event = createS3Event({
      etag: "f1234567890abcdef1234567890abcdef",
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 5120000,
      versionId: "integrated-version-123",
    });

    const snsMessage = createSNSMessage({
      messageId: "integrated-object-test-message",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved with correct file_type
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.INTEGRATED_OBJECT);
    expect(file.file_type).toBe(FILE_TYPE.INTEGRATED_OBJECT); // Should be derived from integrated-objects folder
    expect(file.source_study_id).toBeNull(); // Integrated objects don't use source_study_id
    expect(file.component_atlas_id).not.toBeNull(); // Should be set to component atlas ID
    expect(file.etag).toBe("f1234567890abcdef1234567890abcdef");
    expect(file.size_bytes).toBe("5120000");
    expect(file.version_id).toBe("integrated-version-123");
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.REQUESTED);
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.REQUESTED);
  });

  it("ingest manifest does not create metadata objects", async () => {
    // Capture metadata object counts before processing
    const beforeSdCount = await countSourceDatasets();
    const beforeCaCount = await countComponentAtlases();

    const s3Event = createS3Event({
      etag: "abcdefabcdefabcdefabcdefabcdefab",
      key: TEST_FILE_PATHS.MANIFEST,
      size: 4096,
      versionId: "manifest-noop-123",
    });

    const snsMessage = createSNSMessage({
      messageId: "manifest-noop-test",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Verify file saved as ingest_manifest and not linked to any metadata objects
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.MANIFEST]
    );
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.file_type).toBe("ingest_manifest");
    expect(file.component_atlas_id).toBeNull();
    expect(file.source_dataset_id).toBeNull();

    // Verify no new metadata objects were created
    const afterSdCount = await countSourceDatasets();
    const afterCaCount = await countComponentAtlases();
    expect(afterSdCount).toBe(beforeSdCount);
    expect(afterCaCount).toBe(beforeCaCount);
  });

  it("correctly identifies ingest manifest file type from S3 path", async () => {
    const s3Event = createS3Event({
      etag: "c9876543210fedcba9876543210fedcba",
      key: TEST_FILE_PATHS.MANIFEST,
      size: 2048,
      versionId: "manifest-version-456",
    });

    const snsMessage = createSNSMessage({
      messageId: "manifest-test-message",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved with correct file_type
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.MANIFEST]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.MANIFEST);
    expect(file.file_type).toBe(FILE_TYPE.INGEST_MANIFEST); // Should be derived from manifests folder
    expect(file.source_study_id).toBeNull(); // Ingest manifests don't use source_study_id
    expect(file.etag).toBe("c9876543210fedcba9876543210fedcba");
    expect(file.size_bytes).toBe("2048");
    expect(file.version_id).toBe("manifest-version-456");
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.PENDING);
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.PENDING);
  });

  // Parameterized test for atlas lookup from S3 paths
  test.each([
    {
      description: "retina atlas from eye network S3 path",
      etag: "d4e5f6789012345678901234567890ab",
      expectedToValidate: true,
      key: "eye/retina-v1/integrated-objects/retina-data.h5ad",
      size: 8192000,
      versionId: "retina-version-789",
    },
    {
      description: "gut v1.1 atlas with version parsing",
      etag: "e5f6789012345678901234567890abcd",
      expectedToValidate: true,
      key: "gut/gut-v1-1/integrated-objects/gut-v11-data.h5ad",
      size: 4096000,
      versionId: "gut-v11-version-012",
    },
    {
      description: "gut v1 atlas with integer version (no decimal)",
      etag: "f6789012345678901234567890abcdef",
      expectedToValidate: false,
      key: "gut/gut-v1/manifests/gut-v1-no-decimal.json",
      size: 1024,
      versionId: "gut-v1-no-decimal-version",
    },
  ])(
    "correctly identifies $description",
    async ({ etag, expectedToValidate, key, size, versionId }) => {
      const s3Event = createS3Event({
        etag,
        key,
        size,
        versionId,
      });

      const snsMessage = createSNSMessage({
        messageId: "atlas-lookup-test-message",
        s3Event,
        signature: TEST_SIGNATURE,
        subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
        timestamp: TEST_TIMESTAMP,
      });

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: snsMessage,
        method: METHOD.POST,
      });

      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });

      expect(res.statusCode).toBe(200);

      // Check that file was saved and linked appropriately when applicable
      const fileRows = await query<HCAAtlasTrackerDBFile>(
        SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
        [TEST_S3_BUCKET, key]
      );

      expect(fileRows.rows).toHaveLength(1);
      const file = fileRows.rows[0];
      expect(file.bucket).toBe(TEST_S3_BUCKET);
      expect(file.key).toBe(key);
      if (key.includes("integrated-objects")) {
        // Integrated objects should link to a component atlas
        expect(file.component_atlas_id).not.toBeNull();
      }
      expect(file.etag).toBe(etag);
      expect(file.size_bytes).toBe(size.toString());
      expect(file.version_id).toBe(versionId);
      expect(file.validation_status).toBe(
        expectedToValidate
          ? FILE_VALIDATION_STATUS.REQUESTED
          : FILE_VALIDATION_STATUS.PENDING
      );
      expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
      expect(file.integrity_status).toBe(
        expectedToValidate
          ? INTEGRITY_STATUS.REQUESTED
          : INTEGRITY_STATUS.PENDING
      );
    }
  );

  // S3 Path Validation Tests

  it("rejects S3 notifications with unknown network", async () => {
    const s3Event = createS3Event({
      etag: "unknown-network-etag",
      key: "not-a-bionetwork/gut-v1/integrated-objects/test.h5ad", // Invalid folder type
      size: 1024,
      versionId: "unknown-network-version",
    });

    const snsMessage = createSNSMessage({
      messageId: "unknown-network-test",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.message).toContain(
      "Unknown bionetwork: not-a-bionetwork"
    );
  });

  it("rejects S3 notifications with invalid key format (too few path segments)", async () => {
    await withConsoleMessageHiding(async () => {
      const s3Event = createS3Event({
        etag: "invalid-etag-test",
        key: "invalid/path.h5ad", // Only 2 segments, need 4+
        size: 1024,
        versionId: "invalid-version",
      });

      const snsMessage = createSNSMessage({
        messageId: "invalid-path-test",
        s3Event,
        signature: TEST_SIGNATURE,
        subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
        timestamp: TEST_TIMESTAMP,
      });

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: snsMessage,
        method: METHOD.POST,
      });

      await snsHandler(req, res);

      expect(res.statusCode).toBe(400);
      const responseBody = JSON.parse(res._getData());
      expect(responseBody.message).toContain("Invalid S3 key format");
      expect(responseBody.message).toContain(
        "Expected format: bio_network/atlas-name/folder-type/filename"
      );
    });
  });

  it("rejects S3 notifications with unknown folder type", async () => {
    const s3Event = createS3Event({
      etag: "unknown-folder-etag",
      key: "gut/gut-v1/unknown-folder/test.h5ad", // Invalid folder type
      size: 1024,
      versionId: "unknown-folder-version",
    });

    const snsMessage = createSNSMessage({
      messageId: "unknown-folder-test",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.message).toContain(
      "Unknown folder type: unknown-folder"
    );
    expect(responseBody.message).toContain(
      "Expected: source-datasets, integrated-objects, or manifests"
    );
  });

  it("rejects S3 notifications with invalid atlas version in key (strict normalization)", async () => {
    await withConsoleMessageHiding(async () => {
      const s3Event = createS3Event({
        etag: "invalid-atlas-version-etag",
        key: "gut/gut-v1-10/source-datasets/invalid-version.h5ad", // v1-10 -> DB 1.10 (invalid per strict normalization)
        size: 1024,
        versionId: "invalid-atlas-version",
      });

      const snsMessage = createSNSMessage({
        messageId: "invalid-atlas-version-test",
        s3Event,
        signature: TEST_SIGNATURE,
        subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
        timestamp: TEST_TIMESTAMP,
      });

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: snsMessage,
        method: METHOD.POST,
      });

      await snsHandler(req, res);

      // Expect 400 once strict normalization is enforced in s3-notification service
      expect(res.statusCode).toBe(400);
      const responseBody = JSON.parse(res._getData());
      expect(responseBody.message).toContain("Invalid atlas version");
    });
  });

  // Database Constraint Validation Tests
  it("database constraint prevents source_dataset files from having component_atlas_id", async () => {
    // This test verifies the database constraint by attempting a direct INSERT that violates it
    // The constraint should prevent source_dataset files from having component_atlas_id set

    await expect(
      query(
        `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, validation_status, is_latest, file_type, source_study_id, component_atlas_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NULL, $11)`,
        [
          "test-bucket",
          "bio_network/test/source-datasets/invalid.h5ad",
          "version123",
          "abc123def456",
          1024,
          JSON.stringify({
            eventName: TEST_S3_EVENT_NAME_OBJECT_CREATED,
            eventTime: TEST_TIMESTAMP_ALT,
          }),
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          INTEGRITY_STATUS.PENDING,
          FILE_VALIDATION_STATUS.PENDING,
          "source_dataset", // source_dataset with component_atlas_id should be rejected
          TEST_GUT_ATLAS_ID, // This should cause constraint violation
        ]
      )
    ).rejects.toThrow(/constraint/);
  });

  it("database constraint prevents integrated_object files from missing component_atlas_id", async () => {
    // This test verifies the database constraint by attempting a direct INSERT that violates it
    // The constraint should require integrated_object files to have component_atlas_id set

    await expect(
      query(
        `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, validation_status, is_latest, file_type, source_study_id, component_atlas_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NULL, NULL)`,
        [
          "test-bucket",
          "bio_network/test/integrated-objects/invalid.h5ad",
          "version123",
          "abc123def456",
          1024,
          JSON.stringify({
            eventName: TEST_S3_EVENT_NAME_OBJECT_CREATED,
            eventTime: TEST_TIMESTAMP_ALT,
          }),
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          INTEGRITY_STATUS.PENDING,
          FILE_VALIDATION_STATUS.PENDING,
          "integrated_object", // integrated_object without component_atlas_id should be rejected
          // component_atlas_id is NULL, which should cause constraint violation
        ]
      )
    ).rejects.toThrow(/constraint/);
  });

  it("rejects S3 events with multiple records", async () => {
    // Create an S3 event with multiple records (duplicate the same record)
    const s3Event = createS3Event({
      etag: "abc123def456",
      eventName: TEST_S3_EVENT_NAME_OBJECT_CREATED,
      key: "bio_network/test/integrated-objects/test.h5ad",
      size: 1024,
      versionId: "version123",
    });

    // Add a second record to make it invalid
    s3Event.Records.push(s3Event.Records[0]);

    const snsMessage = createSNSMessage({
      messageId: "test-message-id",
      s3Event,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    // Override the message content with our multi-record S3 event
    snsMessage.Message = JSON.stringify(s3Event);

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Expected exactly 1 S3 record, but received 2 records",
    });
  });

  it("starts a validation job after saving a new source dataset file and after saving an updated source dataset file", async () => {
    mockSubmitJob.mockClear();

    // First upload (creates source dataset and file record)
    const firstEvent = createS3Event({
      etag: "sd-v1-etag-11111111111111111111111111111111",
      eventTime: TEST_TIMESTAMP, // older
      key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      size: 12345,
      versionId: "sd-version-1",
    });

    const firstMessage = createSNSMessage({
      messageId: "sd-update-test-v1",
      s3Event: firstEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: firstMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Check that the dataset validator was called
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      })
    );

    // Second upload (update) with newer eventTime
    const secondEvent = createS3Event({
      etag: "sd-v2-etag-22222222222222222222222222222222",
      eventTime: TEST_TIMESTAMP_PLUS_1H, // newer
      key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      size: 23456,
      versionId: "sd-version-2",
    });

    const secondMessage = createSNSMessage({
      messageId: "sd-update-test-v2",
      s3Event: secondEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: secondMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Check that the dataset validator was called again
    expect(mockSubmitJob).toHaveBeenCalledTimes(2);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED,
      })
    );
  });

  it("starts a validation job after saving a new integrated object file and after saving an updated integrated object file", async () => {
    mockSubmitJob.mockClear();

    // First upload (creates source dataset and file record)
    const firstEvent = createS3Event({
      etag: "io-v1-etag-11111111111111111111111111111111",
      eventTime: TEST_TIMESTAMP, // older
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 12345,
      versionId: "io-version-1",
    });

    const firstMessage = createSNSMessage({
      messageId: "io-update-test-v1",
      s3Event: firstEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: firstMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Check that the dataset validator was called
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      })
    );

    // Second upload (update) with newer eventTime
    const secondEvent = createS3Event({
      etag: "io-v2-etag-22222222222222222222222222222222",
      eventTime: TEST_TIMESTAMP_PLUS_1H, // newer
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 23456,
      versionId: "io-version-2",
    });

    const secondMessage = createSNSMessage({
      messageId: "io-update-test-v2",
      s3Event: secondEvent,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    {
      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: secondMessage,
        method: METHOD.POST,
      });
      await withConsoleMessageHiding(async () => {
        await snsHandler(req, res);
      });
      expect(res.statusCode).toBe(200);
    }

    // Check that the dataset validator was called again
    expect(mockSubmitJob).toHaveBeenCalledTimes(2);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      })
    );
  });

  it("does not start a validation job after saving a manifest file", async () => {
    mockSubmitJob.mockClear();

    const s3Event = createS3Event({
      etag: "c9876543210fedcba9876543210fedcba",
      key: TEST_FILE_PATHS.MANIFEST,
      size: 2048,
      versionId: "manifest-version-789",
    });

    const snsMessage = createSNSMessage({
      messageId: "manifest-test-message",
      s3Event,
      signature: TEST_SIGNATURE,
      subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that the dataset validator was not called
    expect(mockSubmitJob).not.toHaveBeenCalled();
  });

  it("does not start a validation job for a duplicate message", async () => {
    mockSubmitJob.mockClear();

    const s3Event = createS3Event({
      etag: "e1234567890abcdef1234567890abcdef",
      key: TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE,
      size: 2048000,
      versionId: "abc123def456ghi789jkl012mno345pqr",
    });

    const snsMessage = createSNSMessage({
      messageId: "duplicate-test-message",
      s3Event,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage,
      method: METHOD.POST,
    });

    // First request
    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Check that the dataset validator was called for the initial request
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE,
      })
    );

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage,
      method: METHOD.POST,
    });

    // Second request with same data
    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Check that the dataset validator has still only been called once
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
  });

  it("does not start a validation job when older version arrives after newer version", async () => {
    mockSubmitJob.mockClear();

    // Process newer version first
    const s3EventV2 = createS3Event({
      etag: "ooo-foo-version2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      eventTime: TEST_TIMESTAMP_PLUS_1H,
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 2048000,
      versionId: "ooo-foo-version-2",
    });

    const snsMessageV2 = createSNSMessage({
      messageId: "out-of-order-foo-v2",
      s3Event: s3EventV2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_PLUS_1H,
    });

    const { req: reqNewer, res: resNewer } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV2,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(reqNewer, resNewer);
    });
    expect(resNewer.statusCode).toBe(200);

    // Check that the dataset validator was called for the initial request
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
    expect(mockSubmitJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        s3Key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      })
    );

    // Now process an older version afterwards (out-of-order arrival)
    const s3EventV1 = createS3Event({
      etag: "ooo-foo-version1-etag-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      eventTime: TEST_TIMESTAMP, // earlier than V2
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 1024000,
      versionId: "ooo-foo-version-1",
    });

    const snsMessageV1 = createSNSMessage({
      messageId: "out-of-order-foo-v1",
      s3Event: s3EventV1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: reqOlder, res: resOlder } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV1,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(reqOlder, resOlder);
    });
    expect(resOlder.statusCode).toBe(200);

    // Check that the dataset validator has still only been called once
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
  });

  it("sets validation status to request_failed and leaves integrity status as pending when an error occurs while starting validation job", async () => {
    mockSubmitJob.mockClear();

    // Mock submitDatasetValidationJob to throw an error
    mockSubmitJob.mockImplementationOnce(() => {
      throw new Error("Validation job submission failed");
    });

    const s3Event = createS3Event({
      etag: "validation-error-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      key: TEST_FILE_PATHS.SOURCE_DATASET_TEST,
      size: 1024000,
      versionId: "validation-error-version",
    });

    const snsMessage = createSNSMessage({
      messageId: "validation-error-test-message",
      s3Event,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      }
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved to database with correct status
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_TEST]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.SOURCE_DATASET_TEST);
    expect(file.etag).toBe(
      "validation-error-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    expect(file.size_bytes).toBe("1024000");
    expect(file.version_id).toBe("validation-error-version");
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.REQUEST_FAILED);
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.PENDING);
    expect(file.file_type).toBe(FILE_TYPE.SOURCE_DATASET);

    // Verify that submitJob was called once and failed
    expect(mockSubmitJob).toHaveBeenCalledTimes(1);
    expect(mockSubmitJob).not.toHaveReturned();
  });
});
