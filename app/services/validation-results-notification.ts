import { FILE_VALIDATOR_NAMES } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  DatasetValidatorResults,
  DatasetValidatorResultsMetadata,
  datasetValidatorResultsMetadataSchema,
  datasetValidatorResultsSchema,
  DatasetValidatorToolReports,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidationSummary,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { validateS3BucketAuthorization } from "../config/aws-resources";
import {
  addValidationResultsToFile,
  AddValidationResultsToFileParams,
  getLastValidationTimestamp,
} from "../data/files";
import { ConflictError, InvalidOperationError } from "../utils/api-errors";
import { doTransaction } from "./database";
import { deleteObject, getObjectAsString } from "./s3-operations";

/**
 * Fields to be checked for consistency between validation results in S3 and SNS message data.
 */
const REQUIRED_MATCHING_METADATA_KEYS = [
  "file_id",
  "status",
  "timestamp",
  "bucket",
  "key",
  "batch_job_id",
] as const;

/**
 * Processes an SNS notification message containing dataset validation results
 * @param snsMessage - The authorized SNS message containing validation results
 * @throws InvalidOperationError if the SNS message doesn't contain a valid validation results message
 */
export async function processValidationResultsMessage(
  snsMessage: SNSMessage,
): Promise<void> {
  // Parse and validate SNS message data

  const validationMetadata = await parseAndValidateValidationResults(
    snsMessage.Message,
    `SNS message ${snsMessage.MessageId}`,
    (data) => datasetValidatorResultsMetadataSchema.validate(data),
  );

  // Attempt to load the validation results from the S3 claim check, saving
  // an error result if the object is missing or unusable.

  const claimCheck = await loadValidationResultsClaimCheck(validationMetadata);

  if (claimCheck.outcome === "error") {
    await saveClaimCheckErrorResult(claimCheck, validationMetadata, snsMessage);
    return;
  }

  const validationResults = claimCheck.results;

  // Save validation results

  const basicFields = getBasicValidationFieldsForSaving(validationResults);
  const datasetInfo = getDatasetInfoFromValidationResults(validationResults);
  const validationInfo = getValidationInfo(
    validationResults,
    snsMessage,
    validationResults.error_message,
  );
  const validationStatus =
    validationResults.status === "success"
      ? FILE_VALIDATION_STATUS.COMPLETED
      : validationResults.integrity_status === INTEGRITY_STATUS.INVALID // Currently, the dataset validator sets the status as "failure" when the integrity check doesn't pass
        ? FILE_VALIDATION_STATUS.COMPLETED
        : FILE_VALIDATION_STATUS.JOB_FAILED;
  const [validationReports, validationSummary] =
    getValidationReportsAndSummary(validationResults);

  await saveValidationResults({
    ...basicFields,
    datasetInfo,
    integrityStatus:
      validationResults.integrity_status ?? INTEGRITY_STATUS.PENDING,
    validationInfo,
    validationReports,
    validationStatus,
    validationSummary,
  });

  console.log(
    `Saved validation results from ${basicFields.validatedAt} for file ${basicFields.fileId} (${basicFields.s3Uri}), setting status to ${validationStatus}`,
  );

  // Since claim check errors are handled earlier and exit the function, this will only run if the claim check is successful
  try {
    await deleteObject(claimCheck.bucket, claimCheck.key);
  } catch (e) {
    console.error(
      `Failed to delete S3 claim check s3://${claimCheck.bucket}/${claimCheck.key} for file ${basicFields.fileId}:`,
      e,
    );
  }
}

async function saveClaimCheckErrorResult(
  claimCheck: ValidationResultsClaimCheckError,
  validationMetadata: DatasetValidatorResultsMetadata,
  snsMessage: SNSMessage,
): Promise<void> {
  console.error(
    `Saving error result for claim check located at s3://${claimCheck.bucket ?? "<unknown bucket>"}/${claimCheck.key}:`,
    ...(claimCheck.errorDescription ? [claimCheck.errorDescription + ":"] : []),
    claimCheck.error,
  );

  await saveValidationResults({
    ...getBasicValidationFieldsForSaving(validationMetadata),
    datasetInfo: null,
    integrityStatus: INTEGRITY_STATUS.PENDING,
    validationInfo: getValidationInfo(
      validationMetadata,
      snsMessage,
      (claimCheck.errorDescription ? claimCheck.errorDescription + ": " : "") +
        claimCheck.error,
    ),
    validationReports: null,
    validationStatus: FILE_VALIDATION_STATUS.RESULTS_NOT_LOADED,
    validationSummary: null,
  });
}

function getBasicValidationFieldsForSaving(
  validationResults: DatasetValidatorResultsMetadata,
): Pick<SaveValidationResultsParams, "fileId" | "s3Uri" | "validatedAt"> {
  return {
    fileId: validationResults.file_id,
    s3Uri: `s3://${validationResults.bucket}/${validationResults.key}`,
    validatedAt: new Date(validationResults.timestamp),
  };
}

interface SaveValidationResultsParams extends Omit<
  AddValidationResultsToFileParams,
  "client"
> {
  s3Uri: string;
}

async function saveValidationResults(
  params: SaveValidationResultsParams,
): Promise<void> {
  const { s3Uri, ...addResultsParams } = params;
  await doTransaction(async (client) => {
    const lastValidationTime = await getLastValidationTimestamp(
      params.fileId,
      client,
    );

    if (lastValidationTime && params.validatedAt < lastValidationTime) {
      throw new ConflictError(
        `Newer validation results already exist for file with ID ${params.fileId} (${s3Uri}); received time was ${params.validatedAt}`,
      );
    }

    await addValidationResultsToFile({ client, ...addResultsParams });
  });
}

interface ValidationResultsClaimCheck {
  bucket: string;
  key: string;
  outcome: "success";
  results: DatasetValidatorResults;
}

interface ValidationResultsClaimCheckError {
  bucket: string | null;
  error: unknown;
  errorDescription?: string;
  key: string;
  outcome: "error";
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

/**
 * Attempt to load and validate validation results from the S3 claim check
 * object corresponding to the given inline SNS-derived results. The
 * claim-check bucket is read from `AWS_VALIDATION_RESULTS_BUCKET` (a
 * dedicated bucket separate from the data bucket — see the claim-check PRD)
 * and validated against `AWS_RESOURCE_CONFIG.s3_buckets` before any S3
 * operation. The key is constructed from `file_id` and `batch_job_id`.
 *
 * Every failure mode returns `null` so the caller falls back to the inline
 * SNS data. This includes deployment misconfiguration (env var unset, bucket
 * not in `AWS_RESOURCE_CONFIG.s3_buckets`) as well as runtime failures (S3
 * fetch error, schema-invalid payload, metadata mismatch with the SNS
 * message). All failures are logged so misconfiguration is visible in
 * CloudWatch even though it doesn't block processing.
 *
 * @param inlineResults - Validation results parsed from the SNS message.
 * @returns Loaded claim check (bucket, key, validated results), or null if
 *   any failure occurred and the caller should fall back to inline data.
 */
async function loadValidationResultsClaimCheck(
  inlineResults: DatasetValidatorResultsMetadata,
): Promise<ValidationResultsClaimCheck | ValidationResultsClaimCheckError> {
  const fileId = inlineResults.file_id;

  const key = `validation-metadata/${fileId}/${inlineResults.batch_job_id}.json`;

  let bucket: string;
  try {
    bucket = requiredEnv("AWS_VALIDATION_RESULTS_BUCKET");
    validateS3BucketAuthorization(bucket);
  } catch (e) {
    return {
      bucket: null,
      error: e,
      errorDescription: "Claim-check bucket misconfiguration",
      key,
      outcome: "error",
    };
  }

  let body: string;
  try {
    body = await getObjectAsString(bucket, key);
  } catch (e) {
    return {
      bucket,
      error: e,
      errorDescription: "Failed to read S3 object",
      key,
      outcome: "error",
    };
  }

  let results: DatasetValidatorResults;
  try {
    results = await parseAndValidateValidationResults(
      body,
      `S3 claim check s3://${bucket}/${key}`,
      (data) => datasetValidatorResultsSchema.validate(data),
    );
  } catch (e) {
    return {
      bucket,
      error: e,
      errorDescription: "Failed to parse valid data from JSON",
      key,
      outcome: "error",
    };
  }

  try {
    confirmValidationResultsMatchMetadata(results, inlineResults);
  } catch (e) {
    return {
      bucket,
      error: e,
      key,
      outcome: "error",
    };
  }

  console.log(`Loaded S3 claim check for file ${fileId}`);
  return {
    bucket,
    key,
    outcome: "success",
    results,
  };
}

/**
 * Check that metadata fields match between validation results from S3 and SNS message data, and throw an error if they don't.
 * @param validationResults - Validation results from S3 object.
 * @param resultsMetadata - Validation results metadata from SNS message.
 */
function confirmValidationResultsMatchMetadata(
  validationResults: DatasetValidatorResults,
  resultsMetadata: DatasetValidatorResultsMetadata,
): void {
  for (const key of REQUIRED_MATCHING_METADATA_KEYS) {
    if (validationResults[key] !== resultsMetadata[key]) {
      throw new Error(
        `Inconsistent value for ${key} in validation results: got ${JSON.stringify(resultsMetadata[key])} in SNS message but ${JSON.stringify(validationResults[key])} in S3 data`,
      );
    }
  }
}

async function parseAndValidateValidationResults<
  T extends DatasetValidatorResultsMetadata,
>(
  jsonText: string,
  sourceDescription: string,
  validate: (data: unknown) => Promise<T>,
): Promise<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new InvalidOperationError(
      `Failed to parse validation results from ${sourceDescription}; invalid JSON: ${truncateJsonText(jsonText)}`,
    );
  }

  let validationResults: T;

  try {
    validationResults = await validate(parsed);
  } catch (e) {
    console.error(
      `Validation results from ${sourceDescription} contained invalid data: ${truncateJsonText(jsonText)}`,
    );
    throw e;
  }

  try {
    validateS3BucketAuthorization(validationResults.bucket);
  } catch (e) {
    console.error(
      `Validation results from ${sourceDescription} contained invalid bucket: ${JSON.stringify(validationResults.bucket)}`,
    );
    throw e;
  }

  return validationResults;
}

function truncateJsonText(jsonText: string, maxLength = 3000): string {
  return jsonText.length > maxLength
    ? `${jsonText.substring(0, maxLength)} (remaining ${jsonText.length - maxLength} characters of JSON truncated)`
    : jsonText;
}

/**
 * Convert metadata from the given validation results into dataset info to be saved in a file record.
 * @param validationResults - Validation results to get dataset info from.
 * @returns - Dataset info, or null if metadata is not present in the validation results.
 */
function getDatasetInfoFromValidationResults(
  validationResults: DatasetValidatorResults,
): HCAAtlasTrackerDBFileDatasetInfo | null {
  const metadataSummary = validationResults.metadata_summary;
  if (metadataSummary === null) return null;
  return {
    assay: metadataSummary.assay,
    cellCount: metadataSummary.cell_count,
    disease: metadataSummary.disease,
    geneCount: metadataSummary.gene_count,
    suspensionType: metadataSummary.suspension_type,
    tissue: metadataSummary.tissue,
    title: metadataSummary.title,
  };
}

/**
 * Get validation metadata to be saved in a file record.
 * @param validationResults - Validation results to get info from.
 * @param snsMessage - SNS message to get info from.
 * @param errorMessage - Error message, if present, to include in the validation info.
 * @returns - Validation info.
 */
function getValidationInfo(
  validationResults: DatasetValidatorResultsMetadata,
  snsMessage: SNSMessage,
  errorMessage: string | null,
): HCAAtlasTrackerDBFileValidationInfo {
  return {
    batchJobId: validationResults.batch_job_id,
    snsMessageId: snsMessage.MessageId,
    snsMessageTime: snsMessage.Timestamp,
    ...(errorMessage === null ? {} : { errorMessage }),
  };
}

/**
 * Get validation reports and summary based on given validation results.
 * @param validationResults - Dataset validator results.
 * @returns validation reports and summary.
 */
function getValidationReportsAndSummary(
  validationResults: DatasetValidatorResults,
): [FileValidationReports | null, FileValidationSummary | null] {
  if (validationResults.tool_reports === null) return [null, null];
  return toolReportsToValidationReportsAndSummary(
    validationResults.tool_reports,
  );
}

/**
 * Get validation reports and summary based on tool reports from validation results.
 * @param toolReports - Tool reports.
 * @returns validation reports and summary.
 */
export function toolReportsToValidationReportsAndSummary(
  toolReports: DatasetValidatorToolReports,
): [FileValidationReports, FileValidationSummary] {
  const validationReports: FileValidationReports = {};
  const validationSummary: FileValidationSummary = {
    overallValid: true,
    validators: {},
  };
  for (const validatorName of FILE_VALIDATOR_NAMES) {
    const validatorResults = toolReports[validatorName];
    const validatorReport = {
      errors: validatorResults.errors,
      finishedAt: validatorResults.finished_at,
      startedAt: validatorResults.started_at,
      valid: validatorResults.valid,
      warnings: validatorResults.warnings,
    };
    validationReports[validatorName] = validatorReport;
    validationSummary.validators[validatorName] = {
      errorCount: validatorReport.errors.length,
      valid: validatorReport.valid,
      warningCount: validatorReport.warnings.length,
    };
    validationSummary.overallValid =
      validationSummary.overallValid && validatorReport.valid;
  }
  return [validationReports, validationSummary];
}
