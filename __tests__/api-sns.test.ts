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
} from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool, query } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";
import {
  withConsoleErrorHiding,
  withConsoleMessageHiding,
} from "../testing/utils";

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
const TEST_SIGNATURE_INVALID = "INVALID-SIGNATURE-SHOULD-BE-REJECTED";
const TEST_ERROR_MESSAGE_INVALID_SIGNATURE = "Invalid signature";
const TEST_MODULE_SNS_VALIDATOR = "sns-validator";

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

    await snsHandler(req, res);

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

  it("rejects notifications from unauthorized SNS topics", async () => {
    await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
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
        await withConsoleMessageHiding(async () => {
          await handler(req, res);
        });

        expect(res.statusCode).toBe(200);
      });
    });
  });
});
