import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

jest.mock('sns-validator', () => {
  return jest.fn().mockImplementation(() => ({
    validate: jest.fn((message, callback) => {
      // Check if this is our test case for invalid signatures
      if (message.Signature === "INVALID-SIGNATURE-SHOULD-BE-REJECTED") {
        callback(new Error("Invalid signature"));
        return;
      }
      
      // For all other test cases, simulate successful validation
      callback(null, message);
    })
  }));
});

const TEST_ROUTE = "/api/files/s3-notification";

import s3NotificationHandler from "../pages/api/files/s3-notification";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-POST request", async () => {
    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.GET,
      }
    );

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(405);
  });

  it("returns error 400 for invalid SNS message payload", async () => {
    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.POST,
        body: {
          invalid: "payload"
        },
      }
    );

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
  });

  it("successfully processes valid SNS notification with S3 ObjectCreated event", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          eventTime: "2024-01-01T12:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          s3: {
            s3SchemaVersion: "1.0",
            bucket: {
              name: "hca-atlas-tracker-data-dev"
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/test-file.h5ad",
              size: 1024000,
              eTag: "d41d8cd98f00b204e9800998ecf8427e",
              versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko"
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "12345678-1234-1234-1234-123456789012",
      TopicArn: "arn:aws:sns:us-east-1:123456789012:s3-notifications",
      Subject: "Amazon S3 Notification",
      Message: JSON.stringify(s3Event),
      Timestamp: "2024-01-01T12:00:00.000Z",
      SignatureVersion: "1",
      Signature: "fake-signature-for-testing",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.POST,
        body: snsMessage,
      }
    );

    await s3NotificationHandler(req, res);

    expect(res.statusCode).toBe(200);
    
    // Check that file was saved to database
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/test-file.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.etag).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(file.size_bytes).toBe("1024000"); // PostgreSQL bigint returns as string
    expect(file.version_id).toBe("096fKKXTRTtl3on89fVO.nfljtsv6qko");
    expect(file.status).toBe("uploaded");
  });

  it("handles duplicate notifications idempotently", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          eventTime: "2024-01-01T12:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          s3: {
            s3SchemaVersion: "1.0",
            bucket: {
              name: "hca-atlas-tracker-data-dev"
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/duplicate-test.h5ad",
              size: 2048000,
              eTag: "e1234567890abcdef1234567890abcdef",
              versionId: "abc123def456ghi789jkl012mno345pqr"
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "duplicate-test-message",
      TopicArn: "arn:aws:sns:us-east-1:123456789012:s3-notifications",
      Subject: "Amazon S3 Notification",
      Message: JSON.stringify(s3Event),
      Timestamp: "2024-01-01T12:00:00.000Z",
      SignatureVersion: "1",
      Signature: "fake-signature-for-testing",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req: req1, res: res1 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.POST,
        body: snsMessage,
      }
    );

    // First request
    await s3NotificationHandler(req1, res1);
    expect(res1.statusCode).toBe(200);

    const { req: req2, res: res2 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.POST,
        body: snsMessage,
      }
    );

    // Second request with same data
    await s3NotificationHandler(req2, res2);
    expect(res2.statusCode).toBe(200);

    // Should still only have one record
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/duplicate-test.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
  });

  it("rejects SNS messages with invalid signatures", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          eventTime: "2023-01-01T00:00:00.000Z",
          eventName: "ObjectCreated:Put",
          s3: {
            bucket: {
              name: "hca-atlas-tracker-data-dev",
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/auth-test.h5ad",
              size: 256000,
              eTag: "invalid-signature-test",
              versionId: "auth-test-version",
            },
          },
        },
      ],
    };

    const snsMessageWithInvalidSignature = {
      Type: "Notification",
      MessageId: "auth-test-message",
      TopicArn: "arn:aws:sns:us-east-1:123456789012:s3-notifications",
      Subject: "Amazon S3 Notification",
      Message: JSON.stringify(s3Event),
      Timestamp: "2023-01-01T00:00:00.000Z",
      SignatureVersion: "1",
      Signature: "INVALID-SIGNATURE-SHOULD-BE-REJECTED",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessageWithInvalidSignature,
      }
    );

    await s3NotificationHandler(req, res);

    // Should reject with 401 Unauthorized due to invalid signature
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: "SNS signature validation failed",
    });

    // Verify no file was saved to database
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/auth-test.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(0);
  });

  it("rejects notifications with ETag mismatches for existing files", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          eventTime: "2023-01-01T00:00:00.000Z",
          eventName: "ObjectCreated:Put",
          s3: {
            bucket: {
              name: "hca-atlas-tracker-data-dev",
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/etag-test.h5ad",
              size: 128000,
              eTag: "original-etag-12345",
              versionId: "version-123",
            },
          },
        },
      ],
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "etag-test-message-1",
      TopicArn: "arn:aws:sns:us-east-1:123456789012:s3-notifications",
      Subject: "Amazon S3 Notification",
      Message: JSON.stringify(s3Event),
      Timestamp: "2023-01-01T00:00:00.000Z",
      SignatureVersion: "1",
      Signature: "valid-signature-for-testing",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    // First notification - should succeed
    const { req: req1, res: res1 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessage,
      }
    );

    await s3NotificationHandler(req1, res1);
    expect(res1.statusCode).toBe(200);

    // Second notification with different ETag - should be rejected
    const s3EventWithDifferentETag = {
      ...s3Event,
      Records: [
        {
          ...s3Event.Records[0],
          s3: {
            ...s3Event.Records[0].s3,
            object: {
              ...s3Event.Records[0].s3.object,
              eTag: "different-etag-67890", // Different ETag!
            },
          },
        },
      ],
    };

    const snsMessageWithDifferentETag = {
      ...snsMessage,
      MessageId: "etag-test-message-2",
      Message: JSON.stringify(s3EventWithDifferentETag),
    };

    const { req: req2, res: res2 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessageWithDifferentETag,
      }
    );

    await s3NotificationHandler(req2, res2);

    // Should reject with 500 Internal Server Error due to ETag mismatch
    expect(res2.statusCode).toBe(500);
    expect(JSON.parse(res2._getData())).toEqual({
      error: "Internal server error",
    });

    // Verify only one record exists with original ETag
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/etag-test.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    expect(fileRows.rows[0].etag).toBe("original-etag-12345");
  });
});
