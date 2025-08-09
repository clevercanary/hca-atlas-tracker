// Set up AWS resource configuration BEFORE any other imports
const TEST_AWS_CONFIG = {
  sns_topics: ["arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications"],
  s3_buckets: ["hca-atlas-tracker-data-dev"]
};
process.env.AWS_RESOURCE_CONFIG = JSON.stringify(TEST_AWS_CONFIG);

import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";
import { withConsoleErrorHiding } from "../testing/utils";
import { resetConfigCache } from "../app/config/aws-resources";

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

  it("returns error 400 for S3 event missing SHA256 metadata", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          awsRegion: "us-east-1",
          eventTime: "2024-01-01T12:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C818",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpL"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "hca-atlas-tracker-data-dev",
              arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/test-file.h5ad",
              size: 1024000,
              eTag: "d41d8cd98f00b204e9800998ecf8427e",
              versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
              sequencer: "0055AED6DCD90281ED"
              // Missing userMetadata with source-sha256 - this is intentional for this test
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "12345678-1234-1234-1234-123456789012",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "SHA256 metadata is required for file integrity validation"
    });
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
              versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
              userMetadata: {
                "source-sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "12345678-1234-1234-1234-123456789012",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(200);
    
    // Check that file was saved to database
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/test-file.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe("hca-atlas-tracker-data-dev");
    expect(file.key).toBe("bio_network/gut-v1/source-datasets/test-file.h5ad");
    expect(file.etag).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(file.size_bytes).toBe("1024000"); // PostgreSQL bigint returns as string
    expect(file.version_id).toBe("096fKKXTRTtl3on89fVO.nfljtsv6qko");
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(file.integrity_status).toBe("pending");
    expect(file.sha256_server).toBeNull();
    expect(file.integrity_checked_at).toBeNull();
    expect(file.integrity_error).toBeNull();
    expect(file.file_type).toBe("source_dataset"); // New field - should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation
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
              versionId: "abc123def456ghi789jkl012mno345pqr",
              userMetadata: {
                "source-sha256": "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "duplicate-test-message",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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
    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    const { req: req2, res: res2 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: METHOD.POST,
        body: snsMessage,
      }
    );

    // Second request with same data
    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Should still only have one record
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/duplicate-test.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.file_type).toBe("source_dataset"); // Should be derived from S3 path
    expect(file.source_study_id).toBeNull(); // Should be NULL initially for staged validation
  });

  it("rejects SNS messages with invalid signatures", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          awsRegion: "us-east-1",
          eventTime: "2023-01-01T00:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C812",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpF"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "hca-atlas-tracker-data-dev",
              arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/auth-test.h5ad",
              size: 256000,
              eTag: "invalid-signature-test",
              versionId: "auth-test-version",
              sequencer: "0055AED6DCD90281E7",
              userMetadata: {
                "source-sha256": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              }
            }
          }
        }
      ]
    };

    const snsMessageWithInvalidSignature = {
      Type: "Notification",
      MessageId: "auth-test-message",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

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
          awsRegion: "us-east-1",
          eventTime: "2023-01-01T00:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C813",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpG"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "hca-atlas-tracker-data-dev",
              arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/etag-test.h5ad",
              size: 128000,
              eTag: "original-etag-12345",
              versionId: "version-123",
              sequencer: "0055AED6DCD90281E8",
              userMetadata: {
                "source-sha256": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "etag-test-message-1",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req1, res1);
    });
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
              userMetadata: {
                "source-sha256": "6789012345678901234567890123456789012345678901234567890123456789"
              }
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req2, res2);
    });

    // Should reject with 500 Internal Server Error due to ETag mismatch
    expect(res2.statusCode).toBe(500);
    expect(JSON.parse(res2._getData())).toEqual({
      error: "Data integrity error - ETag mismatch detected",
    });

    // Verify only one record exists with original ETag
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/etag-test.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    expect(fileRows.rows[0].etag).toBe("original-etag-12345");
  });

  it("maintains is_latest flag correctly for file versions", async () => {
    // First version of the file
    const s3EventV1 = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          awsRegion: "us-east-1",
          eventTime: "2024-01-01T12:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C814",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpH"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "hca-atlas-tracker-data-dev",
              arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/versioned-file.h5ad",
              size: 1024000,
              eTag: "version1-etag-12345678901234567890123456789012",
              versionId: "version-1",
              sequencer: "0055AED6DCD90281E9",
              userMetadata: {
                "source-sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
              }
            }
          }
        }
      ]
    };

    const snsMessageV1 = {
      Type: "Notification",
      MessageId: "test-message-id-v1",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
      Message: JSON.stringify(s3EventV1),
      Timestamp: "2024-01-01T12:00:00.000Z",
      SignatureVersion: "1",
      Signature: "valid-signature",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req: req1, res: res1 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessageV1,
      }
    );

    // Process first version
    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req1, res1);
    });
    expect(res1.statusCode).toBe(200);

    // Second version of the same file (different version_id and etag)
    const s3EventV2 = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          awsRegion: "us-east-1",
          eventTime: "2024-01-01T13:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C815",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpI"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "hca-atlas-tracker-data-dev",
              arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "bio_network/gut-v1/source-datasets/versioned-file.h5ad", // Same key
              size: 2048000,
              eTag: "version2-etag-98765432109876543210987654321098",
              versionId: "version-2", // Different version
              sequencer: "0055AED6DCD90281EA",
              userMetadata: {
                "source-sha256": "b2c3d4e5f678901234567890123456789012345678901234567890123456789a"
              }
            }
          }
        }
      ]
    };

    const snsMessageV2 = {
      Type: "Notification",
      MessageId: "test-message-id-v2",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
      Message: JSON.stringify(s3EventV2),
      Timestamp: "2024-01-01T13:00:00.000Z",
      SignatureVersion: "1",
      Signature: "valid-signature",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req: req2, res: res2 } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessageV2,
      }
    );

    // Process second version
    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req2, res2);
    });
    expect(res2.statusCode).toBe(200);

    // Check database state - should have 2 records for the same file
    const allVersions = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 ORDER BY created_at ASC",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/versioned-file.h5ad"]
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
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/source-datasets/versioned-file.h5ad"]
    );

    expect(latestOnly.rows).toHaveLength(1);
    expect(latestOnly.rows[0].version_id).toBe("version-2");
    expect(latestOnly.rows[0].etag).toBe("version2-etag-98765432109876543210987654321098");
  });

  it("rejects notifications from unauthorized SNS topics", async () => {
    await withConsoleErrorHiding(async () => {
      const s3Event = {
        Records: [
          {
            eventVersion: "2.1",
            eventSource: "aws:s3",
            awsRegion: "us-east-1",
            eventTime: "2024-01-01T12:00:00.000Z",
            eventName: "s3:ObjectCreated:Put",
            userIdentity: {
              principalId: "AIDAJDPLRKLG7UEXAMPLE"
            },
            requestParameters: {
              sourceIPAddress: "127.0.0.1"
            },
            responseElements: {
              "x-amz-request-id": "C3D13FE58DE4C816",
              "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpJ"
            },
            s3: {
              s3SchemaVersion: "1.0",
              configurationId: "testConfigRule",
              bucket: {
                name: "hca-atlas-tracker-data-dev",
                arn: "arn:aws:s3:::hca-atlas-tracker-data-dev",
                ownerIdentity: {
                  principalId: "A3NL1KOZZKExample"
                }
              },
              object: {
                key: "test-file.h5ad",
                size: 1024000,
                eTag: "d41d8cd98f00b204e9800998ecf8427e",
                versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
                sequencer: "0055AED6DCD90281EB",
                userMetadata: {
                  "source-sha256": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
                }
              }
            }
          }
        ]
      };

      const unauthorizedSnsMessage = {
        Type: "Notification",
        MessageId: "unauthorized-topic-test",
        TopicArn: "arn:aws:sns:us-east-1:123456789012:unauthorized-topic",
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
          body: unauthorizedSnsMessage,
        }
      );

      const handler = (await import("../pages/api/files/s3-notification")).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unauthorized SNS topic",
        topicArn: "arn:aws:sns:us-east-1:123456789012:unauthorized-topic"
      });
    });
  });

  it("rejects notifications from unauthorized S3 buckets", async () => {
    const s3Event = {
      Records: [
        {
          eventVersion: "2.1",
          eventSource: "aws:s3",
          awsRegion: "us-east-1",
          eventTime: "2024-01-01T12:00:00.000Z",
          eventName: "s3:ObjectCreated:Put",
          userIdentity: {
            principalId: "AIDAJDPLRKLG7UEXAMPLE"
          },
          requestParameters: {
            sourceIPAddress: "127.0.0.1"
          },
          responseElements: {
            "x-amz-request-id": "C3D13FE58DE4C817",
            "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpK"
          },
          s3: {
            s3SchemaVersion: "1.0",
            configurationId: "testConfigRule",
            bucket: {
              name: "unauthorized-bucket",
              arn: "arn:aws:s3:::unauthorized-bucket",
              ownerIdentity: {
                principalId: "A3NL1KOZZKExample"
              }
            },
            object: {
              key: "test-file.h5ad",
              size: 1024000,
              eTag: "d41d8cd98f00b204e9800998ecf8427e",
              versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
              sequencer: "0055AED6DCD90281EC",
              userMetadata: {
                "source-sha256": "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "unauthorized-bucket-test",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
      Subject: "Amazon S3 Notification",
      Message: JSON.stringify(s3Event),
      Timestamp: "2024-01-01T12:00:00.000Z",
      SignatureVersion: "1",
      Signature: "fake-signature-for-testing",
      SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-fake.pem",
    };

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        method: "POST",
        body: snsMessage,
      }
    );

    const handler = (await import("../pages/api/files/s3-notification")).default;
    await withConsoleErrorHiding(async () => {
      await handler(req, res);
    });

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Unauthorized S3 buckets",
      unauthorizedBuckets: ["unauthorized-bucket"],
      message: "Request rejected due to unauthorized bucket access"
    });
  });

  it("correctly identifies integrated object file type from S3 path", async () => {
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
              key: "bio_network/gut-v1/integrated-objects/atlas.h5ad",
              size: 5120000,
              eTag: "f1234567890abcdef1234567890abcdef",
              versionId: "integrated-version-123",
              userMetadata: {
                "source-sha256": "b1c2d3e4f5678901234567890123456789012345678901234567890123456789"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "integrated-object-test-message",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(200);
    
    // Check that file was saved with correct file_type
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/integrated-objects/atlas.h5ad"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe("hca-atlas-tracker-data-dev");
    expect(file.key).toBe("bio_network/gut-v1/integrated-objects/atlas.h5ad");
    expect(file.file_type).toBe("integrated_object"); // Should be derived from integrated-objects folder
    expect(file.etag).toBe("f1234567890abcdef1234567890abcdef");
    expect(file.size_bytes).toBe("5120000");
    expect(file.version_id).toBe("integrated-version-123");
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBe("b1c2d3e4f5678901234567890123456789012345678901234567890123456789");
    expect(file.integrity_status).toBe("pending");
  });

  it("correctly identifies ingest manifest file type from S3 path", async () => {
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
              key: "bio_network/gut-v1/manifests/upload-manifest.json",
              size: 2048,
              eTag: "c9876543210fedcba9876543210fedcba",
              versionId: "manifest-version-456",
              userMetadata: {
                "source-sha256": "c2d3e4f5678901234567890123456789012345678901234567890123456789ab"
              }
            }
          }
        }
      ]
    };

    const snsMessage = {
      Type: "Notification",
      MessageId: "manifest-test-message",
      TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

    await withConsoleErrorHiding(async () => {
      await s3NotificationHandler(req, res);
    });

    expect(res.statusCode).toBe(200);
    
    // Check that file was saved with correct file_type
    const fileRows = await query(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      ["hca-atlas-tracker-data-dev", "bio_network/gut-v1/manifests/upload-manifest.json"]
    );
    
    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.bucket).toBe("hca-atlas-tracker-data-dev");
    expect(file.key).toBe("bio_network/gut-v1/manifests/upload-manifest.json");
    expect(file.file_type).toBe("ingest_manifest"); // Should be derived from manifests folder
    expect(file.etag).toBe("c9876543210fedcba9876543210fedcba");
    expect(file.size_bytes).toBe("2048");
    expect(file.version_id).toBe("manifest-version-456");
    expect(file.status).toBe("uploaded");
    expect(file.sha256_client).toBe("c2d3e4f5678901234567890123456789012345678901234567890123456789ab");
    expect(file.integrity_status).toBe("pending");
  });

  it("rejects S3 notifications with invalid key format (too few path segments)", async () => {
    await withConsoleErrorHiding(async () => {
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
                key: "invalid/path.h5ad", // Only 2 segments, need 4+
                size: 1024,
                eTag: "invalid-etag-test",
                versionId: "invalid-version",
                userMetadata: {
                  "source-sha256": "d3e4f5678901234567890123456789012345678901234567890123456789abcd"
                }
              }
            }
          }
        ]
      };

      const snsMessage = {
        Type: "Notification",
        MessageId: "invalid-path-test",
        TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

      expect(res.statusCode).toBe(400);
      const responseBody = JSON.parse(res._getData());
      expect(responseBody.error).toContain("Invalid S3 key format");
      expect(responseBody.error).toContain("Expected format: bio_network/atlas-name/folder-type/filename");
    });
  });

  it("rejects S3 notifications with unknown folder type", async () => {
    await withConsoleErrorHiding(async () => {
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
                key: "bio_network/gut-v1/unknown-folder/test.h5ad", // Invalid folder type
                size: 1024,
                eTag: "unknown-folder-etag",
                versionId: "unknown-folder-version",
                userMetadata: {
                  "source-sha256": "e4f5678901234567890123456789012345678901234567890123456789abcdef"
                }
              }
            }
          }
        ]
      };

      const snsMessage = {
        Type: "Notification",
        MessageId: "unknown-folder-test",
        TopicArn: TEST_AWS_CONFIG.sns_topics[0],
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

      expect(res.statusCode).toBe(400);
      const responseBody = JSON.parse(res._getData());
      expect(responseBody.error).toContain("Unknown folder type: unknown-folder");
      expect(responseBody.error).toContain("Expected: source-datasets, integrated-objects, or manifests");
    });
  });
});
