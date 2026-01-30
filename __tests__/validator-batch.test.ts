import {
  BatchClient,
  SubmitJobCommand,
  SubmitJobCommandInput,
} from "@aws-sdk/client-batch";
import { submitDatasetValidationJob } from "app/services/validator-batch";
import { mockClient } from "aws-sdk-client-mock";
import { TEST_S3_BUCKET } from "testing/constants";

// Project-wide mocks for DB connection etc.
jest.mock("../app/utils/pg-app-connect-config");

const batchMock = mockClient(BatchClient);

describe("submitDatasetValidationJob", () => {
  beforeEach(() => {
    batchMock.reset();
    // Clean env between tests
    delete process.env.AWS_BATCH_VALIDATOR_JOB_QUEUE;
    delete process.env.AWS_BATCH_VALIDATOR_JOB_DEFINITION;
    delete process.env.AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN;
    delete process.env.AWS_DATA_BUCKET;
    delete process.env.VALIDATOR_LOG_LEVEL;
    delete process.env.AWS_RESOURCE_CONFIG;
  });

  it("submits a Batch job with required env overrides", async () => {
    // Arrange
    const JOB_QUEUE = "dev-hca-atlas-tracker-validator-batch";
    const JOB_DEFINITION = "dev-hca-atlas-tracker-validator-batch";
    const SNS_TOPIC_ARN =
      "arn:aws:sns:us-east-1:123456789012:dev-hca-atlas-tracker-validation-results";

    process.env.AWS_BATCH_VALIDATOR_JOB_QUEUE = JOB_QUEUE;
    process.env.AWS_BATCH_VALIDATOR_JOB_DEFINITION = JOB_DEFINITION;
    process.env.AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN = SNS_TOPIC_ARN;
    process.env.AWS_DATA_BUCKET = TEST_S3_BUCKET;
    process.env.VALIDATOR_LOG_LEVEL = "INFO";

    // Allowlist config for resources
    process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
      s3_buckets: [TEST_S3_BUCKET],
      sns_topics: [SNS_TOPIC_ARN],
    });

    const fileId = "11111111-2222-3333-4444-555555555555";
    const s3Key = "gut/gut-v1/source-datasets/test-file.h5ad";

    batchMock.on(SubmitJobCommand).resolves({ jobId: "job-abc-123" });

    const client = new BatchClient();

    // Act
    const { jobId } = await submitDatasetValidationJob(
      { fileId, s3Key },
      { batchClient: client },
    );

    // Assert
    expect(jobId).toBe("job-abc-123");

    const calls = batchMock.commandCalls(SubmitJobCommand);
    expect(calls.length).toBe(1);
    const input = calls[0].args[0].input as SubmitJobCommandInput;
    expect(input.jobQueue).toBe(JOB_QUEUE);
    expect(input.jobDefinition).toBe(JOB_DEFINITION);
    type EnvVar = {
      name: string;
      value?: string;
    };
    const env = (input.containerOverrides?.environment ?? []) as EnvVar[];
    // Ensure required environment variables are present
    expect(env).toEqual(
      expect.arrayContaining([
        { name: "S3_BUCKET", value: TEST_S3_BUCKET },
        { name: "S3_KEY", value: s3Key },
        { name: "FILE_ID", value: fileId },
        { name: "SNS_TOPIC_ARN", value: SNS_TOPIC_ARN },
        { name: "LOG_LEVEL", value: "INFO" },
      ]),
    );
  });

  it("throws when required env vars are missing", async () => {
    process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
      s3_buckets: [TEST_S3_BUCKET],
      sns_topics: [],
    });

    const client = new BatchClient();

    await expect(
      submitDatasetValidationJob(
        { fileId: "id", s3Key: "a/b.h5ad" },
        { batchClient: client },
      ),
    ).rejects.toThrow(/AWS_BATCH_VALIDATOR_JOB_QUEUE/);
  });
});
