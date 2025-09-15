import { BatchClient, SubmitJobCommand } from "@aws-sdk/client-batch";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../config/aws-resources";

export interface SubmitDatasetValidationJobParams {
  fileId: string;
  jobName?: string;
  s3Key: string;
}

export interface SubmitDatasetValidationJobOptions {
  batchClient?: BatchClient;
}

export interface SubmitDatasetValidationJobResult {
  jobId: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

/**
 * Submit an AWS Batch job to run the dataset-validator against a specific S3 object.
 *
 * Environment variables read by this function:
 * - AWS_BATCH_VALIDATOR_JOB_QUEUE (required)
 * - AWS_BATCH_VALIDATOR_JOB_DEFINITION (required)
 * - AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN (required – forwarded to container as SNS_TOPIC_ARN)
 * - AWS_DATA_BUCKET (required)
 * - VALIDATOR_LOG_LEVEL (optional – forwarded to container as LOG_LEVEL)
 *
 * @param params - Parameters describing the validation request.
 * @param params.fileId - The tracker file ID associated with the S3 object.
 * @param params.s3Key - The S3 object key for the file to validate.
 * @param params.jobName - Optional explicit job name; defaults to `dataset-validator-<fileId>`.
 * @param opts - Optional submission options.
 * @param opts.batchClient - An optional BatchClient (useful for testing/mocking).
 * @returns A promise that resolves with the submitted AWS Batch job ID.
 */
export async function submitDatasetValidationJob(
  params: SubmitDatasetValidationJobParams,
  opts: SubmitDatasetValidationJobOptions = {}
): Promise<SubmitDatasetValidationJobResult> {
  const jobQueue = requiredEnv("AWS_BATCH_VALIDATOR_JOB_QUEUE");
  const jobDefinition = requiredEnv("AWS_BATCH_VALIDATOR_JOB_DEFINITION");
  const bucket = requiredEnv("AWS_DATA_BUCKET");
  const snsTopicArn = requiredEnv("AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN");
  const validatorLogLevel = optionalEnv("VALIDATOR_LOG_LEVEL");

  // Ensure allowlist validation (uses AWS_RESOURCE_CONFIG)
  validateS3BucketAuthorization(bucket);
  validateSNSTopicAuthorization(snsTopicArn);

  const jobName = params.jobName ?? `dataset-validator-${params.fileId}`;

  const environment = [
    { name: "S3_BUCKET", value: bucket },
    { name: "S3_KEY", value: params.s3Key },
    { name: "FILE_ID", value: params.fileId },
    { name: "BATCH_JOB_NAME", value: jobName },
  ];

  environment.push({ name: "SNS_TOPIC_ARN", value: snsTopicArn });
  if (validatorLogLevel)
    environment.push({ name: "LOG_LEVEL", value: validatorLogLevel });

  const client = opts.batchClient ?? new BatchClient();

  const resp = await client.send(
    new SubmitJobCommand({
      containerOverrides: { environment },
      jobDefinition,
      jobName,
      jobQueue,
    })
  );

  const jobId = resp.jobId;

  if (!jobId) {
    throw new Error("AWS Batch SubmitJob returned no jobId");
  }

  return { jobId };
}
