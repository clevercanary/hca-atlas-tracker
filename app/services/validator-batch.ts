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
 * Returns the claim-check bucket if `AWS_VALIDATION_RESULTS_BUCKET` is set
 * and present in the `AWS_RESOURCE_CONFIG.s3_buckets` allowlist. Otherwise
 * logs and returns undefined so the caller submits without the
 * `VALIDATION_RESULTS_BUCKET` container env var, letting the validator and
 * tracker both fall back to inline SNS data.
 * @returns The validated bucket name, or undefined when unset / unauthorized.
 */
function getValidatedClaimCheckBucket(): string | undefined {
  const bucket = optionalEnv("AWS_VALIDATION_RESULTS_BUCKET");
  if (!bucket) return undefined;
  try {
    validateS3BucketAuthorization(bucket);
    return bucket;
  } catch (e) {
    console.error(
      `Submitting validator job without VALIDATION_RESULTS_BUCKET — env-derived bucket is misconfigured:`,
      e,
    );
    return undefined;
  }
}

/**
 * Submit an AWS Batch job to run the dataset-validator against a specific S3 object.
 *
 * Environment variables read by this function:
 * - AWS_BATCH_VALIDATOR_JOB_QUEUE (required)
 * - AWS_BATCH_VALIDATOR_JOB_DEFINITION (required)
 * - AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN (required – forwarded to container as SNS_TOPIC_ARN)
 * - AWS_DATA_BUCKET (required – forwarded to container as S3_BUCKET)
 * - AWS_VALIDATION_RESULTS_BUCKET (optional – forwarded to container as
 *   VALIDATION_RESULTS_BUCKET when set; the validator writes claim-check
 *   payloads here. Optional so a missing/misconfigured env var degrades
 *   gracefully — the validator falls back to inline-only SNS output, and
 *   the tracker's claim-check loader (validation-results-notification.ts)
 *   falls back to inline data correspondingly.)
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
  opts: SubmitDatasetValidationJobOptions = {},
): Promise<SubmitDatasetValidationJobResult> {
  const jobQueue = requiredEnv("AWS_BATCH_VALIDATOR_JOB_QUEUE");
  const jobDefinition = requiredEnv("AWS_BATCH_VALIDATOR_JOB_DEFINITION");
  const bucket = requiredEnv("AWS_DATA_BUCKET");
  const snsTopicArn = requiredEnv("AWS_BATCH_VALIDATOR_SNS_TOPIC_ARN");
  const validatorLogLevel = optionalEnv("VALIDATOR_LOG_LEVEL");

  // Ensure allowlist validation (uses AWS_RESOURCE_CONFIG)
  validateS3BucketAuthorization(bucket);
  validateSNSTopicAuthorization(snsTopicArn);

  // Optional: only forward when set and authorized. Missing or
  // misconfigured → log and submit without it; the validator and tracker
  // both fall back to inline SNS without claim-check.
  const validationResultsBucket = getValidatedClaimCheckBucket();

  const jobName = params.jobName ?? `dataset-validator-${params.fileId}`;

  const environment = [
    { name: "S3_BUCKET", value: bucket },
    { name: "S3_KEY", value: params.s3Key },
    { name: "FILE_ID", value: params.fileId },
    { name: "BATCH_JOB_NAME", value: jobName },
  ];

  if (validationResultsBucket) {
    environment.push({
      name: "VALIDATION_RESULTS_BUCKET",
      value: validationResultsBucket,
    });
  }

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
    }),
  );

  const jobId = resp.jobId;

  if (!jobId) {
    throw new Error("AWS Batch SubmitJob returned no jobId");
  }

  return { jobId };
}
