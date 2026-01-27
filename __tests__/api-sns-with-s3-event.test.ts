import {
  createS3Event,
  createSNSMessage,
  createTestAtlasData,
  doS3Event,
  S3EventOptions,
  setUpAwsConfig,
  SNS_MESSAGE_DEFAULTS,
  SNSMessageOptions,
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
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  INTEGRITY_STATUS,
  PUBLICATION_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool, query } from "../app/services/database";
import {
  countComponentAtlases,
  countSourceDatasets,
  expectFileNotToBeReferencedByAnyMetadataEntity,
  expectSourceDatasetFileToBeConsistentWith,
  getAtlasFromDatabase,
  getComponentAtlasAtlas,
  getComponentAtlasFromDatabase,
  getFileComponentAtlas,
  getFileSourceDataset,
  resetDatabase,
} from "../testing/db-utils";
import { expectIsDefined, withConsoleMessageHiding } from "../testing/utils";

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
  await resetDatabase(false);
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

    // Check fields and relationships
    await expectSourceDatasetFileToBeConsistentWith(file.id, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      wipNumber: 1,
    });
  });

  it("does not clear sd_info on source_dataset update, and preserves is_latest", async () => {
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

    // Ensure first file is marked latest
    const firstFileResult = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_LATEST_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED]
    );
    expect(firstFileResult.rows).toHaveLength(1);
    const firstFileId = firstFileResult.rows[0].id;

    // Update sd_info and get its value before updating the file
    const sdInfoUpdateFields: Partial<HCAAtlasTrackerDBSourceDatasetInfo> = {
      capUrl: "https://celltype.info/project/234234/dataset/534636",
      publicationStatus: PUBLICATION_STATUS.PUBLISHED,
    };
    const sdInfoResult = await query<
      Pick<HCAAtlasTrackerDBSourceDataset, "sd_info">
    >(
      "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE file_id = $2 RETURNING sd_info",
      [JSON.stringify(sdInfoUpdateFields), firstFileId]
    );
    const sdInfoBefore = sdInfoResult.rows[0].sd_info;
    expect(sdInfoBefore).toMatchObject(sdInfoUpdateFields);

    // Check fields and relationships before update
    const { sourceDataset: firstSourceDataset } =
      await expectSourceDatasetFileToBeConsistentWith(firstFileId, {
        atlas: TEST_GUT_ATLAS_ID,
        isLatest: true,
        wipNumber: 1,
      });

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

    // Verify sd_info remains the same on the linked source dataset
    const sdAfter = await query(
      "SELECT sd_info FROM hat.source_datasets WHERE version_id = $1",
      [firstSourceDataset.version_id]
    );
    expect(sdAfter.rows).toHaveLength(1);
    expect(sdAfter.rows[0].sd_info).toEqual(sdInfoBefore);

    // Verify file versioning flags: latest remains true on newest, previous false
    const versions = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_VERSIONED]
    );
    expect(versions.rows).toHaveLength(2);
    expect(versions.rows[0].is_latest).toBe(false); // older
    expect(versions.rows[1].is_latest).toBe(true); // newer

    // Check fields and relationships for new entities
    await expectSourceDatasetFileToBeConsistentWith(versions.rows[1].id, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      otherVersion: firstSourceDataset,
      wipNumber: 2,
    });
  });

  it("does not modify existing component atlas on integrated_object update, and preserves is_latest", async () => {
    // First upload (creates component atlas and file record)
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

    // Ensure first file is marked latest
    const firstFileResult = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_LATEST_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );
    expect(firstFileResult.rows).toHaveLength(1);
    const firstFile = firstFileResult.rows[0];
    expect(firstFile.is_latest).toBe(true);

    // Capture the created component atlas before update
    const firstComponentAtlas = await getFileComponentAtlas(firstFile.id);
    const componentAtlasVersion = firstComponentAtlas.version_id;

    // Ensure first component atlas is marked latest and has WIP number 1
    expect(firstComponentAtlas.is_latest).toEqual(true);
    expect(firstComponentAtlas.wip_number).toEqual(1);

    // Get the first component atlas's atlas for later checks
    const atlasBefore = await getComponentAtlasAtlas(
      firstComponentAtlas.version_id
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

    // Verify that the first component atlas remains the same, exluding updated_at and is_latest, the latter of which should be false
    const firstComponentAtlasAfter = await getComponentAtlasFromDatabase(
      componentAtlasVersion
    );
    if (!expectIsDefined(firstComponentAtlasAfter)) return;
    expect({
      ...firstComponentAtlasAfter,
      is_latest: undefined,
      updated_at: undefined,
    }).toEqual({
      ...firstComponentAtlas,
      is_latest: undefined,
      updated_at: undefined,
    });
    expect(firstComponentAtlasAfter.is_latest).toEqual(false);

    // Verify file versioning flags: latest remains true on newest, previous false
    const versions = await query(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );
    expect(versions.rows).toHaveLength(2);
    expect(versions.rows[0].is_latest).toBe(false); // older
    expect(versions.rows[1].is_latest).toBe(true); // newer

    // Get new file's component atlas, compare it to the first component atlas, and check that it's marked as latest and has WIP number 2
    const secondComponentAtlas = await getFileComponentAtlas(
      versions.rows[1].id
    );
    expect(secondComponentAtlas).not.toEqual(firstComponentAtlasAfter);
    expect(secondComponentAtlas.id).toEqual(firstComponentAtlas.id);
    expect(secondComponentAtlas.component_info).toEqual(
      firstComponentAtlas.component_info
    );
    expect(secondComponentAtlas.source_datasets).toEqual(
      firstComponentAtlas.source_datasets
    );
    expect(secondComponentAtlas.is_latest).toEqual(true);
    expect(secondComponentAtlas.wip_number).toEqual(2);

    // Check that the atlas's component atlas list is updated
    const atlasAfter = await getAtlasFromDatabase(atlasBefore.id);
    if (expectIsDefined(atlasAfter)) {
      expect(atlasAfter.component_atlases).not.toContain(
        firstComponentAtlas.version_id
      );
      expect(atlasAfter.component_atlases).toContain(
        secondComponentAtlas.version_id
      );
    }
  });

  // Happy Path Processing Tests
  it("successfully processes valid SNS notification for source dataset with S3 ObjectCreated event", async () => {
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

    // Check fields and relationships
    await expectSourceDatasetFileToBeConsistentWith(file.id, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      wipNumber: 1,
    });
  });

  it("successfully processes valid SNS notification for integrated object with S3 ObjectCreated event", async () => {
    const s3Event = createS3Event({
      etag: "15abed36c8f34eec8f787b9be86ca9a3",
      key: TEST_FILE_PATHS.INTEGRATED_OBJECT,
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "e61c1590-f3fd-4297-93e2-d1e03f09dd4b",
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
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe(TEST_S3_BUCKET);
    expect(file.key).toBe(TEST_FILE_PATHS.INTEGRATED_OBJECT);
    expect(file.etag).toBe("15abed36c8f34eec8f787b9be86ca9a3");
    expect(file.size_bytes).toBe("1024000"); // PostgreSQL bigint returns as string
    expect(file.version_id).toBe(TEST_VERSION_IDS.DEFAULT);
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.REQUESTED);
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.REQUESTED);
    expect(file.sha256_server).toBeNull();
    expect(file.integrity_checked_at).toBeNull();
    expect(file.integrity_error).toBeNull();
    expect(file.file_type).toBe(FILE_TYPE.INTEGRATED_OBJECT); // New field - should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation

    // Verify component was created and linked to atlas
    const componentAtlas = await getFileComponentAtlas(file.id);
    const componentAtlasVersion = componentAtlas.version_id;

    // Verify atlas has the component atlas in its component_atlases array
    const atlasRows = await query(
      "SELECT component_atlases FROM hat.atlases WHERE id = $1",
      [TEST_GUT_ATLAS_ID]
    );
    expect(atlasRows.rows).toHaveLength(1);
    expect(atlasRows.rows[0].component_atlases).toContain(
      componentAtlasVersion
    );

    // Verify component atlas is latest and has WIP number 1
    expect(componentAtlas.is_latest).toEqual(true);
    expect(componentAtlas.wip_number).toEqual(1);
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

    // Get file ID and check fields and relationships
    const fileRowsBefore = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_DUPLICATE]
    );
    expect(fileRowsBefore.rows).toHaveLength(1);
    const fileId = fileRowsBefore.rows[0].id;
    const {
      sourceDataset: { version_id: sourceDatasetVersion },
    } = await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      wipNumber: 1,
    });

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
    expect(file.is_latest).toEqual(true);
    expect(file.id).toEqual(fileId);

    // Check fields and relationships -- should be the same as before
    await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      sourceDataset: sourceDatasetVersion,
      wipNumber: 1,
    });
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

    // Get file ID and check fields and relationships
    const fileRowsBefore = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_ETAG]
    );
    expect(fileRowsBefore.rows).toHaveLength(1);
    const fileId = fileRowsBefore.rows[0].id;
    const {
      sourceDataset: { version_id: sourceDatasetVersion },
    } = await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      wipNumber: 1,
    });

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
    expect(fileRows.rows[0].id).toEqual(fileId);

    // Check fields and relationships -- should be the same as before
    await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      sourceDataset: sourceDatasetVersion,
      wipNumber: 1,
    });
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

    // Get file ID and check fields and relationships
    const fileRowsBefore = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.SOURCE_DATASET_ETAG]
    );
    expect(fileRowsBefore.rows).toHaveLength(1);
    const fileId = fileRowsBefore.rows[0].id;
    const {
      sourceDataset: { version_id: sourceDatasetVersion },
    } = await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      wipNumber: 1,
    });

    // Second notification with different ETag - should be rejected
    const s3EventWithDifferentETag = createS3Event({
      etag: "different-etag-67890", // Different ETag!
      eventTime: TEST_TIMESTAMP,
      key: TEST_FILE_PATHS.SOURCE_DATASET_ETAG,
      size: 128000,
      versionId: "version-123",
    });

    const snsMessageWithDifferentETag = createSNSMessage({
      messageId: "etag-test-message-2",
      s3Event: s3EventWithDifferentETag,
      signature: TEST_SIGNATURE_VALID_FOR_TESTING,
      timestamp: TEST_TIMESTAMP,
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
    expect(fileRows.rows[0].id).toEqual(fileId);

    // Check fields and relationships -- should be the same as before
    await expectSourceDatasetFileToBeConsistentWith(fileId, {
      atlas: TEST_GUT_ATLAS_ID,
      isLatest: true,
      sourceDataset: sourceDatasetVersion,
      wipNumber: 1,
    });
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
    const allVersions = await query<HCAAtlasTrackerDBFile>(
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

    // Check component atlases
    const firstComponentAtlas = await getFileComponentAtlas(firstVersion.id);
    const secondComponentAtlas = await getFileComponentAtlas(secondVersion.id);
    expect(firstComponentAtlas).not.toEqual(secondComponentAtlas);
    expect(firstComponentAtlas.id).toEqual(secondComponentAtlas.id);
    expect(firstComponentAtlas.is_latest).toEqual(false);
    expect(secondComponentAtlas.is_latest).toEqual(true);
    expect(firstComponentAtlas.wip_number).toEqual(1);
    expect(secondComponentAtlas.wip_number).toEqual(2);
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
    const allVersions = await query<HCAAtlasTrackerDBFile>(
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

    // Check component atlases
    const firstComponentAtlas = await getFileComponentAtlas(firstVersion.id);
    const secondComponentAtlas = await getFileComponentAtlas(secondVersion.id);
    expect(firstComponentAtlas).not.toEqual(secondComponentAtlas);
    expect(firstComponentAtlas.id).toEqual(secondComponentAtlas.id);
  });

  it("updates source dataset arrays for only latest-version component atlases when a new source dataset version is added", async () => {
    // Create initial files -- two source datasets and one integrated object

    const snsMessages: [S3EventOptions, Omit<SNSMessageOptions, "s3Event">][] =
      [
        [
          {
            etag: "e7d55daafc184c9b9cf3248d889e218a",
            eventTime: "2026-01-27T05:11:20.120Z",
            key: "gut/gut-v1/source-datasets/sd-a.h5ad",
            size: 23423,
            versionId: "sd-a-v1",
          },
          {
            messageId: "18c3a894-15db-44d4-9337-f67144c1daec",
          },
        ],
        [
          {
            etag: "bd9984c4179943adbb7ebb9696f47556",
            key: "gut/gut-v1/source-datasets/sd-b.h5ad",
            size: 32543,
            versionId: "sd-b-v1",
          },
          {
            messageId: "fdb55e4e-895e-4555-86fc-a6f6e6d09aa4",
          },
        ],
        [
          {
            etag: "eb3ddef3d7cc4882ad0a71e5417f75ca",
            eventTime: "2026-01-27T06:01:55.197Z",
            key: "gut/gut-v1/integrated-objects/io-a.h5ad",
            size: 46566,
            versionId: "io-a-v1",
          },
          {
            messageId: "1d195e8d-701e-4fac-87d1-06cc53b5e421",
          },
        ],
      ];

    const initialFiles = await withConsoleMessageHiding(async () =>
      Promise.all(
        snsMessages.map(async ([s3EventOptions, snsMessageOptions]) => {
          const fileRows = await doS3Event(s3EventOptions, snsMessageOptions);
          expect(fileRows).toHaveLength(1);
          return fileRows[0];
        })
      )
    );

    const [sdFileA1, sdFileB1, ioFileA1] = initialFiles;

    const sourceDatasetA1 = await getFileSourceDataset(sdFileA1.id);
    const sourceDatasetB = await getFileSourceDataset(sdFileB1.id);

    // Link source datasets to integrated object

    await query(
      "UPDATE hat.component_atlases SET source_datasets = $1 WHERE file_id = $2",
      [[sourceDatasetA1.version_id, sourceDatasetB.version_id], ioFileA1.id]
    );

    // Add new integrated object version

    const [, ioFileA2] = await withConsoleMessageHiding(async () =>
      doS3Event(
        {
          etag: "2956d44f3f624bb7845db0d44d3570b3",
          eventTime: "2026-01-27T06:02:14.768Z",
          key: "gut/gut-v1/integrated-objects/io-a.h5ad",
          size: 49234,
          versionId: "io-a-v2",
        },
        {
          messageId: "6ef1ec02-897e-4147-a526-73031f7b79e1",
        }
      )
    );
    expect(ioFileA2).toBeDefined();
    expect(ioFileA2.is_latest).toEqual(true);

    const componentAtlasA1 = await getFileComponentAtlas(ioFileA1.id);
    const componentAtlasA2 = await getFileComponentAtlas(ioFileA2.id);
    expect(componentAtlasA1.is_latest).toEqual(false);
    expect(componentAtlasA2.is_latest).toEqual(true);

    // Check source datasets before updating A

    await expectSourceDatasetFileToBeConsistentWith(sdFileA1.id, {
      atlas: TEST_GUT_ATLAS_ID,
      componentAtlases: [
        componentAtlasA1.version_id,
        componentAtlasA2.version_id,
      ],
      isLatest: true,
      sourceDataset: sourceDatasetA1.version_id,
      wipNumber: 1,
    });

    await expectSourceDatasetFileToBeConsistentWith(sdFileB1.id, {
      atlas: TEST_GUT_ATLAS_ID,
      componentAtlases: [
        componentAtlasA1.version_id,
        componentAtlasA2.version_id,
      ],
      isLatest: true,
      sourceDataset: sourceDatasetB.version_id,
      wipNumber: 1,
    });

    // Add new version for source dataset A

    const [, sdFileA2] = await withConsoleMessageHiding(async () =>
      doS3Event(
        {
          etag: "99be25cd164e4339ba502f514a1618a5",
          eventTime: "2026-01-27T05:11:42.905Z",
          key: "gut/gut-v1/source-datasets/sd-a.h5ad",
          size: 25464,
          versionId: "sd-a-v2",
        },
        { messageId: "364e573e-1400-4627-b68c-93e9eaf328ff" }
      )
    );
    expect(sdFileA2).toBeDefined();
    expect(sdFileA2.is_latest).toEqual(true);

    // Check source datasets

    // Second version of A should be linked just to the second integrated object version
    const { sourceDataset: sourceDatasetA2 } =
      await expectSourceDatasetFileToBeConsistentWith(sdFileA2.id, {
        atlas: TEST_GUT_ATLAS_ID,
        componentAtlases: [componentAtlasA2.version_id],
        isLatest: true,
        otherVersion: sourceDatasetA1,
        wipNumber: 2,
      });

    // First version of A should be linked just to the first integrated object version
    await expectSourceDatasetFileToBeConsistentWith(sdFileA1.id, {
      atlas: null,
      componentAtlases: [componentAtlasA1.version_id],
      isLatest: false,
      otherVersion: sourceDatasetA2,
      sourceDataset: sourceDatasetA1.version_id,
      wipNumber: 1,
    });

    // B should be linked to both integrated object versions
    await expectSourceDatasetFileToBeConsistentWith(sdFileB1.id, {
      atlas: TEST_GUT_ATLAS_ID,
      componentAtlases: [
        componentAtlasA1.version_id,
        componentAtlasA2.version_id,
      ],
      isLatest: true,
      sourceDataset: sourceDatasetB.version_id,
      wipNumber: 1,
    });
  });

  it("discards notification but returns successfully when older version arrives after newer version", async () => {
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

    const errorMessages: string[][] = [];
    await withConsoleMessageHiding(
      async () => {
        await snsHandler(reqOlder, resOlder);
      },
      true,
      { error: errorMessages }
    );
    expect(resOlder.statusCode).toBe(200);
    expect(errorMessages).toContainEqual(
      expect.arrayContaining([expect.stringContaining("out-of-order")])
    );

    // Expect only one version to exist for this key
    const allRows = await query<HCAAtlasTrackerDBFile>(
      SQL_QUERIES.SELECT_FILE_BY_BUCKET_AND_KEY,
      [TEST_S3_BUCKET, TEST_FILE_PATHS.INTEGRATED_OBJECT]
    );
    expect(allRows.rows).toHaveLength(1);

    // Latest should remain the newer (V2), not be flipped by the older V1 arrival
    const latestFile = allRows.rows[0];
    expect(latestFile.version_id).toBe("ooo-version-2");
    expect(latestFile.etag).toBe(
      "ooo-version2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );

    // Check component atlases
    const latestComponentAtlas = await getFileComponentAtlas(latestFile.id);
    expect(latestComponentAtlas.is_latest).toEqual(true);
    expect(latestComponentAtlas.wip_number).toEqual(1);
    const componentAtlasesResult = await query(
      "SELECT 1 FROM hat.component_atlases WHERE id = $1",
      [latestComponentAtlas.id]
    );
    expect(componentAtlasesResult.rowCount).toEqual(1);
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
    expect(file.etag).toBe("f1234567890abcdef1234567890abcdef");
    expect(file.size_bytes).toBe("5120000");
    expect(file.version_id).toBe("integrated-version-123");
    expect(file.validation_status).toBe(FILE_VALIDATION_STATUS.REQUESTED);
    expect(file.sha256_client).toBeNull(); // No SHA256 in S3 notifications
    expect(file.integrity_status).toBe(INTEGRITY_STATUS.REQUESTED);

    expect(await getFileComponentAtlas(file.id)).toBeTruthy();
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
    await expectFileNotToBeReferencedByAnyMetadataEntity(file.id);

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

      if (file.file_type === FILE_TYPE.SOURCE_DATASET) {
        expect(await getFileSourceDataset(file.id)).toBeTruthy();
      } else if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
        expect(await getFileComponentAtlas(file.id)).toBeTruthy();
      }
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
