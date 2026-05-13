import {
  BatchClient,
  SubmitJobCommand,
  SubmitJobCommandInput,
} from "@aws-sdk/client-batch";
import { resetConfigCache } from "app/config/aws-resources";
import { submitDatasetValidationJob } from "app/services/validator-batch";
import { mockClient } from "aws-sdk-client-mock";
import {
  TEST_S3_BUCKET,
  TEST_VALIDATION_RESULTS_BUCKET,
} from "testing/constants";

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
    delete process.env.AWS_VALIDATION_RESULTS_BUCKET;
    delete process.env.VALIDATOR_LOG_LEVEL;
    delete process.env.AWS_RESOURCE_CONFIG;
    // Force re-parse of AWS_RESOURCE_CONFIG in each test (cache is otherwise
    // populated by the first test that uses it and persists across tests).
    resetConfigCache();
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
    process.env.AWS_VALIDATION_RESULTS_BUCKET = TEST_VALIDATION_RESULTS_BUCKET;
    process.env.VALIDATOR_LOG_LEVEL = "INFO";

    // Allowlist config for resources
    process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
      s3_buckets: [TEST_S3_BUCKET, TEST_VALIDATION_RESULTS_BUCKET],
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
        {
          name: "VALIDATION_RESULTS_BUCKET",
          value: TEST_VALIDATION_RESULTS_BUCKET,
        },
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

  it("submits without VALIDATION_RESULTS_BUCKET when env var is unset", async () => {
    // AWS_VALIDATION_RESULTS_BUCKET is optional: missing → submit succeeds
    // without the container env var, validator falls back to inline-only SNS.
    const SNS_TOPIC_ARN =
      "arn:aws:sns:us-east-1:123456789012:dev-hca-atlas-tracker-validation-results";
    process.env.AWS_BATCH_VALIDATOR_JOB_QUEUE =
      "dev-hca-atlas-tracker-validator-batch";
    process.env.AWS_BATCH_VALIDATOR_JOB_DEFINITION =
      "dev-hca-atlas-tracker-validator-batch";
    process.env.AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN = SNS_TOPIC_ARN;
    process.env.AWS_DATA_BUCKET = TEST_S3_BUCKET;
    process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
      s3_buckets: [TEST_S3_BUCKET],
      sns_topics: [SNS_TOPIC_ARN],
    });

    batchMock.on(SubmitJobCommand).resolves({ jobId: "job-no-bucket" });
    const client = new BatchClient();

    const { jobId } = await submitDatasetValidationJob(
      { fileId: "id", s3Key: "a/b.h5ad" },
      { batchClient: client },
    );

    expect(jobId).toBe("job-no-bucket");
    const calls = batchMock.commandCalls(SubmitJobCommand);
    expect(calls.length).toBe(1);
    const input = calls[0].args[0].input as SubmitJobCommandInput;
    const env = (input.containerOverrides?.environment ?? []) as Array<{
      name: string;
      value?: string;
    }>;
    expect(
      env.find((e) => e.name === "VALIDATION_RESULTS_BUCKET"),
    ).toBeUndefined();
  });

  it("submits without VALIDATION_RESULTS_BUCKET when env var is set but not in the allowlist", async () => {
    // Misconfig: env var is set, but the bucket is not in
    // AWS_RESOURCE_CONFIG.s3_buckets. Logs and submits without the container
    // env var rather than failing the whole submit.
    const SNS_TOPIC_ARN =
      "arn:aws:sns:us-east-1:123456789012:dev-hca-atlas-tracker-validation-results";
    process.env.AWS_BATCH_VALIDATOR_JOB_QUEUE =
      "dev-hca-atlas-tracker-validator-batch";
    process.env.AWS_BATCH_VALIDATOR_JOB_DEFINITION =
      "dev-hca-atlas-tracker-validator-batch";
    process.env.AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN = SNS_TOPIC_ARN;
    process.env.AWS_DATA_BUCKET = TEST_S3_BUCKET;
    process.env.AWS_VALIDATION_RESULTS_BUCKET = TEST_VALIDATION_RESULTS_BUCKET;
    process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
      // Validation-results bucket deliberately absent.
      s3_buckets: [TEST_S3_BUCKET],
      sns_topics: [SNS_TOPIC_ARN],
    });

    batchMock.on(SubmitJobCommand).resolves({ jobId: "job-bad-allowlist" });
    const client = new BatchClient();

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const { jobId } = await submitDatasetValidationJob(
        { fileId: "id", s3Key: "a/b.h5ad" },
        { batchClient: client },
      );

      expect(jobId).toBe("job-bad-allowlist");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Submitting validator job without VALIDATION_RESULTS_BUCKET",
        ),
        expect.anything(),
      );
      const calls = batchMock.commandCalls(SubmitJobCommand);
      expect(calls.length).toBe(1);
      const input = calls[0].args[0].input as SubmitJobCommandInput;
      const env = (input.containerOverrides?.environment ?? []) as Array<{
        name: string;
        value?: string;
      }>;
      expect(
        env.find((e) => e.name === "VALIDATION_RESULTS_BUCKET"),
      ).toBeUndefined();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
