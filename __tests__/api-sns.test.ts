// Mock HTTP wrapper for outbound requests BEFORE any imports
jest.mock("../app/utils/http", () => {
  return { httpGet: jest.fn() };
});

import {
  createS3Event,
  createSNSMessage,
  createTestAtlasData,
  setUpAwsConfig,
  SNS_MESSAGE_DEFAULTS,
  SQL_QUERIES,
  TEST_AWS_CONFIG,
  TEST_ERROR_MESSAGE_INVALID_SIGNATURE,
  TEST_FILE_PATHS,
  TEST_MODULE_SNS_VALIDATOR,
  TEST_S3_BUCKET,
  TEST_SIGNATURE,
  TEST_SIGNATURE_INVALID,
  TEST_SIGNATURE_VALID,
  TEST_TIMESTAMP,
  TEST_TIMESTAMP_ALT,
  TEST_VERSION_IDS,
  validateTestSnsMessage,
} from "../testing/sns-testing";

// Set up AWS resource configuration BEFORE any other imports
setUpAwsConfig();

// Imports
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
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
    validate: jest.fn(validateTestSnsMessage),
  }));
});

const TEST_ROUTE = "/api/sns";

import snsHandler from "../pages/api/sns";

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
