import { INTEGRITY_STATUS } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  DatasetValidatorResults,
  S3Event,
  S3Object,
  SNSMessage,
} from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { query } from "../app/services/database";

export const TEST_S3_BUCKET = "hca-atlas-tracker-data-dev";
export const TEST_GUT_ATLAS_ID = "550e8400-e29b-41d4-a716-446655440000";
export const TEST_S3_EVENT_NAME = "s3:ObjectCreated:Put";
export const TEST_SNS_TOPIC_S3_NOTIFICATIONS =
  "arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications";
export const TEST_SNS_TOPIC_VALIDATION_RESULTS =
  "arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-validation-results";
export const TEST_AWS_CONFIG = {
  s3_buckets: [TEST_S3_BUCKET],
  sns_topics: [
    TEST_SNS_TOPIC_S3_NOTIFICATIONS,
    TEST_SNS_TOPIC_VALIDATION_RESULTS,
  ],
};

export function setUpAwsConfig(): void {
  process.env.AWS_RESOURCE_CONFIG = JSON.stringify(TEST_AWS_CONFIG);
}

// Test file path constants
export const TEST_PATH_SEGMENTS = {
  GUT_V1_INTEGRATED_OBJECTS: "gut/gut-v1/integrated-objects",
  GUT_V1_MANIFESTS: "gut/gut-v1/manifests",
  GUT_V1_SOURCE_DATASETS: "gut/gut-v1/source-datasets",
} as const;

export const TEST_FILE_PATHS = {
  INTEGRATED_OBJECT: `${TEST_PATH_SEGMENTS.GUT_V1_INTEGRATED_OBJECTS}/atlas.h5ad`,
  MANIFEST: `${TEST_PATH_SEGMENTS.GUT_V1_MANIFESTS}/upload-manifest.json`,
  SOURCE_DATASET_AUTH: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/auth-test.h5ad`,
  SOURCE_DATASET_DUPLICATE: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/duplicate-test.h5ad`,
  SOURCE_DATASET_ETAG: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/etag-test.h5ad`,
  SOURCE_DATASET_TEST: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/test-file.h5ad`,
  SOURCE_DATASET_VERSIONED: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-file.h5ad`,
} as const;

// SQL query constants
export const SQL_QUERIES = {
  SELECT_FILE_BY_BUCKET_AND_KEY:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
  SELECT_FILE_BY_BUCKET_AND_KEY_ORDERED:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 ORDER BY created_at ASC",
  SELECT_LATEST_FILE_BY_BUCKET_AND_KEY:
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true",
} as const;

// SNS message constants
export const SNS_MESSAGE_DEFAULTS = {
  SUBJECT: "Amazon S3 Notification",
} as const;

// Test data constants
export const TEST_VERSION_IDS = {
  DEFAULT: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
} as const;

export const TEST_TIMESTAMP = "2024-01-01T12:00:00.000Z";
export const TEST_TIMESTAMP_PLUS_1H = "2024-01-01T13:00:00.000Z";
export const TEST_TIMESTAMP_ALT = "2023-01-01T00:00:00.000Z";
export const TEST_SIGNATURE = "fake-signature-for-testing";
export const TEST_SIGNATURE_VALID = "valid-signature";
export const TEST_SIGNATURE_VALID_FOR_TESTING = "valid-signature-for-testing";
export const TEST_SIGNATURE_INVALID = "INVALID-SIGNATURE-SHOULD-BE-REJECTED";
export const TEST_ERROR_MESSAGE_INVALID_SIGNATURE = "Invalid signature";
export const TEST_MODULE_SNS_VALIDATOR = "sns-validator";
export const TEST_S3_EVENT_NAME_OBJECT_CREATED = "ObjectCreated:Put";

// S3 Event and SNS Message Factory Functions
export interface S3EventOptions {
  bucket?: string;
  etag: string;
  eventName?: string;
  eventTime?: string;
  key: string;
  sha256?: string; // Optional to support tests that intentionally omit SHA256
  size: number;
  versionId: string;
}

export function createS3Event(options: S3EventOptions): S3Event {
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
        s3: {
          bucket: {
            name: options.bucket || TEST_S3_BUCKET,
          },
          object: objectData,
        },
      },
    ],
  };
}

export interface ValidationResultsOptions {
  downloadedSha256?: string | null;
  errorMessage?: string | null;
  fileId: string;
  integrityStatus?: INTEGRITY_STATUS | null;
  key: string;
  metadata?: {
    assay: string[];
    cellCount: number;
    disease: string[];
    suspensionType: string[];
    tissue: string[];
    title: string;
  } | null;
  sha256?: string | null;
  sourceSha256?: string | null;
  status?: DatasetValidatorResults["status"];
  timestamp?: string;
}

export function createValidationResults(
  options: ValidationResultsOptions
): DatasetValidatorResults {
  const { integrityStatus = INTEGRITY_STATUS.VALID, sha256 = "test-sha256" } =
    options;
  const { downloadedSha256 = sha256, sourceSha256 = sha256 } = options;
  return {
    batch_job_id: "test-batch-job-id",
    batch_job_name: "test-batch-job",
    bucket: TEST_S3_BUCKET,
    downloaded_sha256: downloadedSha256,
    error_message: options.errorMessage ?? null,
    file_id: options.fileId,
    integrity_status: integrityStatus,
    key: options.key,
    metadata_summary: options.metadata
      ? {
          assay: options.metadata.assay,
          cell_count: options.metadata.cellCount,
          disease: options.metadata.disease,
          suspension_type: options.metadata.suspensionType,
          tissue: options.metadata.tissue,
          title: options.metadata.title,
        }
      : null,
    source_sha256: sourceSha256,
    status: options.status ?? "success",
    timestamp: options.timestamp ?? TEST_TIMESTAMP,
  };
}

export interface SNSMessageOptions {
  message?: unknown;
  messageId?: string;
  s3Event?: S3Event;
  signature?: string;
  signingCertURL?: string;
  subject?: string;
  timestamp?: string;
  topicArn?: string;
}

export function createSNSMessage(options: SNSMessageOptions): SNSMessage {
  return {
    Message: JSON.stringify(options.s3Event ?? options.message),
    MessageId: options.messageId || "test-message-id",
    Signature: options.signature || TEST_SIGNATURE,
    SignatureVersion: "1",
    SigningCertURL:
      options.signingCertURL ||
      "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    Subject: options.subject || SNS_MESSAGE_DEFAULTS.SUBJECT,
    Timestamp: options.timestamp || TEST_TIMESTAMP,
    TopicArn: options.topicArn || TEST_SNS_TOPIC_S3_NOTIFICATIONS,
    Type: "Notification",
  };
}

export function validateTestSnsMessage(
  message: SNSMessage,
  callback: (e: Error | null, m?: SNSMessage) => void
): void {
  // Check if this is our test case for invalid signatures
  if (message.Signature === TEST_SIGNATURE_INVALID) {
    callback(new Error(TEST_ERROR_MESSAGE_INVALID_SIGNATURE));
    return;
  }

  // For all other test cases, simulate successful validation
  callback(null, message);
}

// Helper function to create test atlas data
export async function createTestAtlasData(): Promise<void> {
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
