// Mock HTTP wrapper for outbound requests BEFORE any imports
jest.mock("../app/utils/http", () => {
  return { httpGet: jest.fn() };
});

// Set up AWS resource configuration BEFORE any other imports
const TEST_S3_BUCKET = "hca-atlas-tracker-data-dev";
const TEST_GUT_ATLAS_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_S3_EVENT_NAME = "s3:ObjectCreated:Put";
const TEST_AWS_CONFIG = {
  s3_buckets: [TEST_S3_BUCKET],
  sns_topics: [
    "arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications",
  ],
};
process.env.AWS_RESOURCE_CONFIG = JSON.stringify(TEST_AWS_CONFIG);

// Imports
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  S3Event,
  S3Object,
  SNSMessage,
} from "../app/apis/catalog/hca-atlas-tracker/aws/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool, query } from "../app/services/database";
import {
  countComponentAtlases,
  countSourceDatasets,
  resetDatabase,
} from "../testing/db-utils";
import { withConsoleErrorHiding } from "../testing/utils";

// Retrieve the mock function created in the jest.mock factory above
const { httpGet } = jest.requireMock("../app/utils/http") as {
  httpGet: jest.Mock;
};
const mockHttpGet = httpGet as jest.Mock;

// Test file path constants
const TEST_PATH_SEGMENTS = {
  GUT_V1_INTEGRATED_OBJECTS: "gut/gut-v1/integrated-objects",
  GUT_V1_MANIFESTS: "gut/gut-v1/manifests",
  GUT_V1_SOURCE_DATASETS: "gut/gut-v1/source-datasets",
} as const;

const TEST_FILE_PATHS = {
  INTEGRATED_OBJECT: `${TEST_PATH_SEGMENTS.GUT_V1_INTEGRATED_OBJECTS}/atlas.h5ad`,
  MANIFEST: `${TEST_PATH_SEGMENTS.GUT_V1_MANIFESTS}/upload-manifest.json`,
  SOURCE_DATASET_AUTH: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/auth-test.h5ad`,
  SOURCE_DATASET_DUPLICATE: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/duplicate-test.h5ad`,
  SOURCE_DATASET_ETAG: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/etag-test.h5ad`,
  SOURCE_DATASET_TEST: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/test-file.h5ad`,
  SOURCE_DATASET_VERSIONED: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-file.h5ad`,
} as const;

// SQL query constants
const SQL_QUERIES = {
  SELECT_FILE_BY_BUCKET_AND_KEY:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
  SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 ORDER BY created_at ASC",
  SELECT_LATEST_FILE_BY_BUCKET_AND_KEY:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true",
} as const;

// SNS message constants
const SNS_MESSAGE_DEFAULTS = {
  SUBJECT: "Amazon S3 Notification",
} as const;

// Test data constants
const TEST_VERSION_IDS = {
  DEFAULT: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
} as const;

const TEST_TIMESTAMP = "2024-01-01T12:00:00.000Z";
const TEST_TIMESTAMP_ALT = "2023-01-01T00:00:00.000Z";
const TEST_SIGNATURE = "fake-signature-for-testing";
const TEST_SIGNATURE_VALID = "valid-signature";
const TEST_SIGNATURE_VALID_FOR_TESTING = "valid-signature-for-testing";
const TEST_SIGNATURE_INVALID = "INVALID-SIGNATURE-SHOULD-BE-REJECTED";
const TEST_ERROR_MESSAGE_INVALID_SIGNATURE = "Invalid signature";
const TEST_MODULE_SNS_VALIDATOR = "sns-validator";
const TEST_S3_EVENT_NAME_OBJECT_CREATED = "ObjectCreated:Put";

// S3 Event and SNS Message Factory Functions
interface S3EventOptions {
  bucket?: string;
  etag: string;
  eventName?: string;
  eventTime?: string;
  key: string;
  sha256?: string; // Optional to support tests that intentionally omit SHA256
  size: number;
  versionId: string;
}

function createS3Event(options: S3EventOptions): S3Event {
  const objectData: S3Object = {
    eTag: options.etag,
    key: options.key,
    size: options.size,
    versionId: options.versionId,
  };

  return {
    Records: [
      {
        eventName: options.eventName || TEST_S3_EVENT_NAME,
        eventSource: "aws:s3",
        eventTime: options.eventTime || TEST_TIMESTAMP,
        eventVersion: "2.1",
        s3: {
          bucket: {
            name: options.bucket || TEST_S3_BUCKET,
          },
          object: objectData,
          s3SchemaVersion: "1.0",
        },
      },
    ],
  };
}

interface SNSMessageOptions {
  messageId?: string;
  s3Event: S3Event;
  signature?: string;
  signingCertURL?: string;
  subject?: string;
  timestamp?: string;
  topicArn?: string;
}

function createSNSMessage(options: SNSMessageOptions): SNSMessage {
  return {
    Message: JSON.stringify(options.s3Event),
    MessageId: options.messageId || "test-message-id",
    Signature: options.signature || TEST_SIGNATURE,
    SignatureVersion: "1",
    SigningCertURL:
      options.signingCertURL ||
      "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    Subject: options.subject || SNS_MESSAGE_DEFAULTS.SUBJECT,
    Timestamp: options.timestamp || TEST_TIMESTAMP,
    TopicArn: options.topicArn || TEST_AWS_CONFIG.sns_topics[0],
    Type: "Notification",
  };
}

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

// (Removed ky mock) Using http wrapper mock at top of file instead

afterEach(() => {
  resetConfigCache();
});

jest.mock("sns-validator", () => {
  return jest.fn().mockImplementation(() => ({
    validate: jest.fn((message, callback) => {
      // Check if this is our test case for invalid signatures
      if (message.Signature === TEST_SIGNATURE_INVALID) {
        callback(new Error(TEST_ERROR_MESSAGE_INVALID_SIGNATURE));
        return;
      }

      // For all other test cases, simulate successful validation
      callback(null, message);
    }),
  }));
});

const TEST_ROUTE = "/api/sns";

import snsHandler from "../pages/api/sns";

// Helper function to create test atlas data
async function createTestAtlasData(): Promise<void> {
  // Create multiple test atlases to cover different network/version scenarios
  const atlases = [
    {
      id: TEST_GUT_ATLAS_ID,
      overview: {
        description: "Test gut atlas for S3 notification integration tests",
        network: "gut", // Matches S3 path 'gut/gut-v1/...'
        shortName: "Gut", // Case-insensitive match with S3 atlas base name 'gut'
        title: "Test Gut Atlas v1",
        version: "1", // DB version format (S3 'v1' -> DB '1')
      },
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      overview: {
        description: "Test retina atlas for S3 notification integration tests",
        network: "eye", // Matches S3 path 'eye/retina-v1/...'
        shortName: "Retina", // Case-insensitive match with S3 atlas base name 'retina'
        title: "Test Retina Atlas v1",
        version: "1", // DB version format (S3 'v1' -> DB '1')
      },
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      overview: {
        description:
          "Test gut atlas v1.1 for S3 notification integration tests",
        network: "gut", // Same network as first gut atlas
        shortName: "Gut", // Same shortName but different version
        title: "Test Gut Atlas v1.1",
        version: "1.1", // DB version format (S3 'v1-1' -> DB '1.1')
      },
    },
  ];

  // Insert all test atlases
  for (const atlas of atlases) {
    await query(
      `INSERT INTO hat.atlases (id, overview, source_studies, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [
        atlas.id,
        JSON.stringify(atlas.overview),
        JSON.stringify([]), // Empty source studies array
        "draft", // Status field
      ]
    );
  }
}

beforeEach(async () => {
  await resetDatabase();
  await createTestAtlasData();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  // HTTP Method Validation Tests
  it("returns error 405 for non-POST request", async () => {
    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.GET,
      }
    );

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(405);
  });

  // SNS Message Structure Validation Tests
  it("returns error 400 for invalid SNS message payload", async () => {
    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: {
          invalid: "payload",
        },
        method: METHOD.POST,
      }
    );

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved to database with NULL SHA256
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.SOURCE_DATASET_TEST,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.sha256_client).toBeNull(); // Should be NULL since no SHA256 provided
    expect(file.integrity_status).toBe("pending");
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved to database
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.SOURCE_DATASET_TEST,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.SOURCE_DATASET_TEST);
    expect(file.etag).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(file.size_bytes).toBe("1024000"); // PostgreSQL bigint returns as string
    expect(file.version_id).toBe(TEST_VERSION_IDS.DEFAULT);
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe("pending");
    expect(file.sha256_server).toBeNull();
    expect(file.integrity_checked_at).toBeNull();
    expect(file.integrity_error).toBeNull();
    expect(file.file_type).toBe("source_dataset"); // New field - should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation

    // Verify source dataset was created and linked to atlas
    const sourceDatasetRows = await query(
      "SELECT id FROM hat.source_datasets WHERE sd_info->>'s3Key' = $1",
      [TEST_FILE_PATHS.SOURCE_DATASET_TEST]
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
    const malformedSNSMessage: SNSMessage = {
      Message:
        '{ "Records": [ { "eventName": "s3:ObjectCreated:Put", "invalid": }', // Truncated/invalid JSON
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    // Should reject with 400 Bad Request due to JSON parsing error
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Failed to parse S3 event from SNS message",
    });
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
    await withConsoleErrorHiding(async () => {
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
    await withConsoleErrorHiding(async () => {
      await snsHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Should still only have one record
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.file_type).toBe("source_dataset"); // Should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation
  });

  // Security and Authentication Tests
  it("rejects SNS messages with invalid signatures", async () => {
    const s3Event = createS3Event({
      etag: "invalid-signature-test",
      eventTime: TEST_TIMESTAMP_ALT,
      key: TEST_FILE_PATHS.SOURCE_DATASET_AUTH,
      size: 256000,
      versionId: "auth-test-version",
    });

    const snsMessageWithInvalidSignature = createSNSMessage({
      messageId: "auth-test-message",
      s3Event,
      signature: TEST_SIGNATURE_INVALID,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessageWithInvalidSignature,
        method: "POST",
      }
    );

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    // Should reject with 401 Unauthorized due to invalid signature
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: "SNS signature validation failed",
    });

    // Verify no file was saved to database
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.SOURCE_DATASET_AUTH,
    ]);

    expect(fileRows.rows).toHaveLength(0);
  });

  // Test data for SNS validator edge cases
  const snsValidatorEdgeCases = [
    {
      expectedMessage: "SNS validation returned no message",
      mockBehavior: (
        message: Record<string, unknown>,
        callback: (err: Error | null, result?: Record<string, unknown>) => void
      ): void => callback(null, undefined),
      size: 128000,
      testId: "no-validated-message",
      testName:
        "rejects SNS messages when validator returns no validated message",
    },
  ];

  test.each(snsValidatorEdgeCases)(
    "$testName",
    async ({ expectedMessage, mockBehavior, size, testId }) => {
      // Temporarily override the mock with specific behavior
      const MockedMessageValidator = jest.mocked(
        jest.requireMock(TEST_MODULE_SNS_VALIDATOR)
      );
      MockedMessageValidator.mockImplementation(() => ({
        validate: jest.fn(mockBehavior),
      }));

      const s3Event = createS3Event({
        etag: `${testId}-test`,
        eventTime: TEST_TIMESTAMP_ALT,
        key: TEST_FILE_PATHS.SOURCE_DATASET_AUTH,
        size,
        versionId: `${testId}-version`,
      });

      const snsMessage = createSNSMessage({
        messageId: `${testId}-test`,
        s3Event,
        signature: TEST_SIGNATURE_VALID,
        timestamp: TEST_TIMESTAMP_ALT,
      });

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: snsMessage,
        method: "POST",
      });

      await withConsoleErrorHiding(async () => {
        await snsHandler(req, res);
      });

      // Should reject with 400 Bad Request
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: expectedMessage,
      });

      // Verify no file was saved to database
      const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
        TEST_S3_BUCKET,
        TEST_FILE_PATHS.SOURCE_DATASET_AUTH,
      ]);

      expect(fileRows.rows).toHaveLength(0);

      // Restore original mock
      MockedMessageValidator.mockImplementation(() => ({
        validate: jest.fn((message, callback) => {
          if (message.Signature === TEST_SIGNATURE_INVALID) {
            callback(new Error(TEST_ERROR_MESSAGE_INVALID_SIGNATURE));
            return;
          }
          callback(null, message);
        }),
      }));
    }
  );

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

    await withConsoleErrorHiding(async () => {
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req2, res2);
    });

    // Should reject with 400 Bad Request due to ETag mismatch (InvalidOperationError)
    expect(res2.statusCode).toBe(400);
    const responseBody = JSON.parse(res2._getData());
    expect(responseBody.message).toContain("ETag mismatch");

    // Verify only one record exists with original ETag
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    expect(fileRows.rows[0].etag).toBe("original-etag-12345");
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
    await withConsoleErrorHiding(async () => {
      await snsHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Second version of the same file (different version_id and etag)
    const s3EventV2 = createS3Event({
      etag: "version2-etag-98765432109876543210987654321098",
      eventTime: "2024-01-01T13:00:00.000Z",
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT, // Same key
      size: 2048000,
      versionId: "version-2", // Different version
    });

    const snsMessageV2 = createSNSMessage({
      messageId: "test-message-id-v2",
      s3Event: s3EventV2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: "2024-01-01T13:00:00.000Z",
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessageV2,
      method: "POST",
    });

    // Process second version
    await withConsoleErrorHiding(async () => {
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

    // Verify we can easily query for latest version only
    const latestOnly = await query(
      SQL_QUERIES.SELECT_LATEST_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    expect(latestOnly.rows).toHaveLength(1);
    expect(latestOnly.rows[0].version_id).toBe("version-2");
    expect(latestOnly.rows[0].etag).toBe(
      "version2-etag-98765432109876543210987654321098"
    );
  });

  it("rejects notifications from unauthorized SNS topics", async () => {
    await withConsoleErrorHiding(async () => {
      const s3Event = createS3Event({
        etag: "d41d8cd98f00b204e9800998ecf8427e",
        key: "test-file.h5ad",
        size: 1024000,
        versionId: TEST_VERSION_IDS.DEFAULT,
      });

      const unauthorizedSnsMessage = createSNSMessage({
        messageId: "unauthorized-topic-test",
        s3Event,
        signature: TEST_SIGNATURE,
        subject: SNS_MESSAGE_DEFAULTS.SUBJECT,
        timestamp: TEST_TIMESTAMP,
        topicArn: UNAUTHORIZED_TOPIC_ARN,
      });

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: unauthorizedSnsMessage,
        method: METHOD.POST,
      });

      const handler = (await import("../pages/api/sns")).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        message: `Unauthorized SNS topic: ${UNAUTHORIZED_TOPIC_ARN}`,
      });
    });
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
    await withConsoleErrorHiding(async () => {
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved with correct file_type
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.INTEGRATED_OBJECT,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.INTEGRATED_OBJECT);
    expect(file.file_type).toBe("integrated_object"); // Should be derived from integrated-objects folder
    expect(file.source_study_id).toBeNull(); // Integrated objects don't use source_study_id
    expect(file.component_atlas_id).not.toBeNull(); // Should be set to component atlas ID
    expect(file.etag).toBe("f1234567890abcdef1234567890abcdef");
    expect(file.size_bytes).toBe("5120000");
    expect(file.version_id).toBe("integrated-version-123");
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe("pending");
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Verify file saved as ingest_manifest and not linked to any metadata objects
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.MANIFEST,
    ]);
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file was saved with correct file_type
    const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
      TEST_S3_BUCKET,
      TEST_FILE_PATHS.MANIFEST,
    ]);

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.MANIFEST);
    expect(file.file_type).toBe("ingest_manifest"); // Should be derived from manifests folder
    expect(file.source_study_id).toBeNull(); // Ingest manifests don't use source_study_id
    expect(file.etag).toBe("c9876543210fedcba9876543210fedcba");
    expect(file.size_bytes).toBe("2048");
    expect(file.version_id).toBe("manifest-version-456");
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe("pending");
  });

  // Parameterized test for atlas lookup from S3 paths
  test.each([
    {
      description: "retina atlas from eye network S3 path",
      etag: "d4e5f6789012345678901234567890ab",
      key: "eye/retina-v1/integrated-objects/retina-data.h5ad",
      size: 8192000,
      versionId: "retina-version-789",
    },
    {
      description: "gut v1.1 atlas with version parsing",
      etag: "e5f6789012345678901234567890abcd",
      key: "gut/gut-v1-1/integrated-objects/gut-v11-data.h5ad",
      size: 4096000,
      versionId: "gut-v11-version-012",
    },
    {
      description: "gut v1 atlas with integer version (no decimal)",
      etag: "f6789012345678901234567890abcdef",
      key: "gut/gut-v1/manifests/gut-v1-no-decimal.json",
      size: 1024,
      versionId: "gut-v1-no-decimal-version",
    },
  ])(
    "correctly identifies $description",
    async ({ etag, key, size, versionId }) => {
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

      await withConsoleErrorHiding(async () => {
        await snsHandler(req, res);
      });

      expect(res.statusCode).toBe(200);

      // Check that file was saved and linked appropriately when applicable
      const fileRows = await query(SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY, [
        TEST_S3_BUCKET,
        key,
      ]);

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
      expect(file.status).toBe("uploaded");
      expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
      expect(file.integrity_status).toBe("pending");
    }
  );

  // S3 Path Validation Tests
  it("rejects S3 notifications with invalid key format (too few path segments)", async () => {
    await withConsoleErrorHiding(async () => {
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

      await withConsoleErrorHiding(async () => {
        await snsHandler(req, res);
      });

      expect(res.statusCode).toBe(400);
      const responseBody = JSON.parse(res._getData());
      expect(responseBody.message).toContain("Invalid S3 key format");
      expect(responseBody.message).toContain(
        "Expected format: bio_network/atlas-name/folder-type/filename"
      );
    });
  });

  it("rejects S3 notifications with unknown folder type", async () => {
    await withConsoleErrorHiding(async () => {
      const s3Event = createS3Event({
        etag: "unknown-folder-etag",
        key: "bio_network/gut-v1/unknown-folder/test.h5ad", // Invalid folder type
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

      const { req, res } = httpMocks.createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        body: snsMessage,
        method: METHOD.POST,
      });

      await withConsoleErrorHiding(async () => {
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
  });
  it("rejects S3 notifications with invalid atlas version in key (strict normalization)", async () => {
    await withConsoleErrorHiding(async () => {
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
        `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_study_id, component_atlas_id)
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
          "pending",
          "uploaded",
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
        `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_study_id, component_atlas_id)
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
          "pending",
          "uploaded",
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

    await withConsoleErrorHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Expected exactly 1 S3 record, but received 2 records",
    });
  });

  // SNS Test Constants (shared across subscription tests)
  const SUBSCRIPTION_CONFIRMATION_SUBJECT =
    "AWS Notification - Subscription Confirmation";
  const SUBSCRIPTION_CONFIRMATION_MESSAGE =
    "You have chosen to subscribe to the topic";
  const SNS_SIGNATURE_VERSION = "1";
  const SIGNING_CERT_URL =
    "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-test.pem";
  const SUBSCRIPTION_CONFIRMATION_TYPE = "SubscriptionConfirmation";
  const SUBSCRIBE_URL_BASE =
    "https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=";
  const SUBSCRIBE_URL = `${SUBSCRIBE_URL_BASE}test&Token=test-token`;
  const UNAUTHORIZED_TOPIC_ARN =
    "arn:aws:sns:us-east-1:123456789012:unauthorized-topic";
  const UNSUBSCRIBE_MESSAGE = "You have unsubscribed from the topic";

  describe("SNS SubscriptionConfirmation handling", () => {
    beforeEach(() => {
      // Reset HTTP wrapper mock before each test
      mockHttpGet.mockClear();
      mockHttpGet.mockResolvedValue({ ok: true });
    });

    describe("SubscriptionConfirmation", () => {
      it("handles valid subscription confirmation with proper topic authorization", async () => {
        const subscriptionConfirmationMessage = {
          Message: SUBSCRIPTION_CONFIRMATION_MESSAGE,
          MessageId: "subscription-test-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          Subject: SUBSCRIPTION_CONFIRMATION_SUBJECT,
          SubscribeURL: SUBSCRIBE_URL,
          Timestamp: TEST_TIMESTAMP,
          TopicArn: TEST_AWS_CONFIG.sns_topics[0], // Use authorized topic
          Type: SUBSCRIPTION_CONFIRMATION_TYPE,
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: subscriptionConfirmationMessage,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(200);
        // HTTP call verification: The 200 response indicates the SubscribeURL was successfully called
      });

      it("rejects subscription confirmation from unauthorized topic", async () => {
        const unauthorizedSubscriptionMessage = {
          Message: SUBSCRIPTION_CONFIRMATION_MESSAGE,
          MessageId: "unauthorized-subscription-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          Subject: SUBSCRIPTION_CONFIRMATION_SUBJECT,
          SubscribeURL: SUBSCRIBE_URL,
          Timestamp: TEST_TIMESTAMP,
          TopicArn: UNAUTHORIZED_TOPIC_ARN,
          Type: SUBSCRIPTION_CONFIRMATION_TYPE,
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: unauthorizedSubscriptionMessage,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual({
          message: `Unauthorized SNS topic: ${UNAUTHORIZED_TOPIC_ARN}`,
        });
      });

      it("rejects subscription confirmation with missing SubscribeURL", async () => {
        const subscriptionMessageWithoutURL = {
          Message: SUBSCRIPTION_CONFIRMATION_MESSAGE,
          MessageId: "missing-url-test-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          Subject: SUBSCRIPTION_CONFIRMATION_SUBJECT,
          // SubscribeURL is intentionally missing
          Timestamp: TEST_TIMESTAMP,
          TopicArn: TEST_AWS_CONFIG.sns_topics[0],
          Type: SUBSCRIPTION_CONFIRMATION_TYPE,
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: subscriptionMessageWithoutURL,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({
          message: "SubscribeURL is required for subscription confirmation",
        });
      });
    });

    describe("UnsubscribeConfirmation", () => {
      it("handles valid unsubscribe confirmation with proper topic authorization", async () => {
        const unsubscribeConfirmationMessage = {
          Message: UNSUBSCRIBE_MESSAGE,
          MessageId: "unsubscribe-test-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          Subject: "AWS Notification - Unsubscribe Confirmation",
          Timestamp: TEST_TIMESTAMP,
          TopicArn: TEST_AWS_CONFIG.sns_topics[0], // Use authorized topic
          Type: "UnsubscribeConfirmation",
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: unsubscribeConfirmationMessage,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(200);
      });

      it("rejects unsubscribe confirmation from unauthorized topic", async () => {
        const unauthorizedUnsubscribeMessage = {
          Message: UNSUBSCRIBE_MESSAGE,
          MessageId: "unauthorized-unsubscribe-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          Subject: "AWS Notification - Unsubscribe Confirmation",
          Timestamp: TEST_TIMESTAMP,
          TopicArn: UNAUTHORIZED_TOPIC_ARN,
          Type: "UnsubscribeConfirmation",
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: unauthorizedUnsubscribeMessage,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual({
          message: `Unauthorized SNS topic: ${UNAUTHORIZED_TOPIC_ARN}`,
        });
      });

      it("handles unsubscribe confirmation without Subject field", async () => {
        const unsubscribeMessageWithoutSubject = {
          Message: UNSUBSCRIBE_MESSAGE,
          MessageId: "no-subject-unsubscribe-message-id",
          Signature: TEST_SIGNATURE,
          SignatureVersion: SNS_SIGNATURE_VERSION,
          SigningCertURL: SIGNING_CERT_URL,
          // Subject is intentionally missing
          Timestamp: TEST_TIMESTAMP,
          TopicArn: TEST_AWS_CONFIG.sns_topics[0],
          Type: "UnsubscribeConfirmation",
        };

        const { req, res } = httpMocks.createMocks<
          NextApiRequest,
          NextApiResponse
        >({
          body: unsubscribeMessageWithoutSubject,
          method: METHOD.POST,
        });

        const handler = (await import("../pages/api/sns")).default;
        await withConsoleErrorHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(200);
      });
    });
  });
});
