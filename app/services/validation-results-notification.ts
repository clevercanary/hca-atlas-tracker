import { FILE_VALIDATOR_NAMES } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  DatasetValidatorResults,
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

  let validationResults = await parseAndValidateValidationResults(
    snsMessage.Message,
    `SNS message ${snsMessage.MessageId}`,
  );

  // Attempt to load the validation results from the S3 claim check, falling
  // back to the inline SNS data if the object is missing or unusable.

  const claimCheck = await loadValidationResultsClaimCheck(validationResults);
  if (claimCheck) validationResults = claimCheck.results;

  // Save validation results

  const s3Uri = `s3://${validationResults.bucket}/${validationResults.key}`;

  const fileId = validationResults.file_id;
  const newValidationTime = new Date(validationResults.timestamp);
  const datasetInfo = getDatasetInfoFromValidationResults(validationResults);
  const validationInfo = getValidationInfo(validationResults, snsMessage);
  const validationStatus =
    validationResults.status === "success"
      ? FILE_VALIDATION_STATUS.COMPLETED
      : validationResults.integrity_status === INTEGRITY_STATUS.INVALID // Currently, the dataset validator sets the status as "failure" when the integrity check doesn't pass
        ? FILE_VALIDATION_STATUS.COMPLETED
        : FILE_VALIDATION_STATUS.JOB_FAILED;
  const [validationReports, validationSummary] =
    getValidationReportsAndSummary(validationResults);

  await doTransaction(async (client) => {
    const lastValidationTime = await getLastValidationTimestamp(fileId, client);

    if (lastValidationTime && newValidationTime < lastValidationTime) {
      throw new ConflictError(
        `Newer validation results already exist for file with ID ${fileId} (${s3Uri}); received time was ${newValidationTime}`,
      );
    }

    await addValidationResultsToFile({
      client,
      datasetInfo,
      fileId,
      integrityStatus:
        validationResults.integrity_status ?? INTEGRITY_STATUS.PENDING,
      validatedAt: newValidationTime,
      validationInfo,
      validationReports,
      validationStatus,
      validationSummary,
    });
  });

  console.log(
    `Saved validation results from ${newValidationTime} for file ${fileId} (${s3Uri}), setting status to ${validationStatus}`,
  );

  if (claimCheck) {
    try {
      await deleteObject(claimCheck.bucket, claimCheck.key);
    } catch (e) {
      console.error(
        `Failed to delete S3 claim check s3://${claimCheck.bucket}/${claimCheck.key} for file ${fileId}:`,
        e,
      );
    }
  }
}

interface ValidationResultsClaimCheck {
  bucket: string;
  key: string;
  results: DatasetValidatorResults;
}

/**
 * Attempt to load and validate validation results from the S3 claim check
 * object corresponding to the given inline SNS-derived results. The claim
 * check key is constructed from `file_id` and `batch_job_id` and read from
 * the same data bucket as the original file.
 * @param inlineResults - Validation results parsed from the SNS message.
 * @returns Loaded claim check (bucket, key, validated results), or null if
 *   the object is unavailable or its contents are invalid.
 */
async function loadValidationResultsClaimCheck(
  inlineResults: DatasetValidatorResults,
): Promise<ValidationResultsClaimCheck | null> {
  const fileId = inlineResults.file_id;
  const bucket = inlineResults.bucket;
  const key = `validation-metadata/${fileId}/${inlineResults.batch_job_id}.json`;

  let body: string;
  try {
    body = await getObjectAsString(bucket, key);
  } catch (e) {
    console.error(
      `Falling back to inline SNS for file ${fileId} (results location s3://${bucket}/${key}):`,
      e,
    );
    return null;
  }

  let results: DatasetValidatorResults;
  try {
    results = await parseAndValidateValidationResults(
      body,
      `S3 claim check s3://${bucket}/${key}`,
    );
  } catch (e) {
    console.error(`Falling back to inline SNS for file ${fileId}:`, e);
    return null;
  }

  try {
    confirmValidationResultsMatchMetadata(results, inlineResults);
  } catch (e) {
    console.error(
      `Falling back to inline SNS for file ${fileId} (results location s3://${bucket}/${key}):`,
      e,
    );
    return null;
  }

  console.log(`Using S3 claim check for file ${fileId}`);
  return { bucket, key, results };
}

/**
 * Check that metadata fields match between validation results from S3 and SNS message data, and throw an error if they don't.
 * @param validationResults - Validation results from S3 object.
 * @param resultsMetadata - Validation results metadata from SNS message.
 */
function confirmValidationResultsMatchMetadata(
  validationResults: DatasetValidatorResults,
  resultsMetadata: DatasetValidatorResults,
): void {
  for (const key of REQUIRED_MATCHING_METADATA_KEYS) {
    if (validationResults[key] !== resultsMetadata[key]) {
      throw new Error(
        `Inconsistent value for ${key} in validation results: got ${JSON.stringify(resultsMetadata[key])} in SNS message but ${JSON.stringify(validationResults[key])} in S3 data`,
      );
    }
  }
}

async function parseAndValidateValidationResults(
  jsonText: string,
  sourceDescription: string,
): Promise<DatasetValidatorResults> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new InvalidOperationError(
      `Failed to parse validation results from ${sourceDescription}; invalid JSON: ${jsonText}`,
    );
  }

  let validationResults: DatasetValidatorResults;

  try {
    validationResults = await datasetValidatorResultsSchema.validate(parsed);
  } catch (e) {
    console.error(
      `Validation results from ${sourceDescription} contained invalid data: ${jsonText}`,
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
 * @returns - Validation info.
 */
function getValidationInfo(
  validationResults: DatasetValidatorResults,
  snsMessage: SNSMessage,
): HCAAtlasTrackerDBFileValidationInfo {
  return {
    batchJobId: validationResults.batch_job_id,
    snsMessageId: snsMessage.MessageId,
    snsMessageTime: snsMessage.Timestamp,
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
