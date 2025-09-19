import {
  DatasetValidatorResults,
  datasetValidatorResultsSchema,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  addValidationResultsToFile,
  getLastValidationTimestamp,
} from "../data/files";
import { ConflictError, InvalidOperationError } from "../utils/api-handler";
import { doTransaction } from "./database";

/**
 * Processes an SNS notification message containing dataset validation results
 * @param snsMessage - The authorized SNS message containing validation results
 * @throws InvalidOperationError if the SNS message doesn't contain a valid validation results message
 */
export async function processValidationResultsMessage(
  snsMessage: SNSMessage
): Promise<void> {
  // Parse and validate SNS message data

  let parsedMessage: unknown;
  try {
    parsedMessage = JSON.parse(snsMessage.Message);
  } catch (parseError) {
    throw new InvalidOperationError(
      "Failed to parse validation results from SNS message"
    );
  }

  const validationResults = await datasetValidatorResultsSchema.validate(
    parsedMessage
  );

  // Save validation results

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

  await doTransaction(async (client) => {
    const lastValidationTime = await getLastValidationTimestamp(fileId, client);

    if (lastValidationTime && newValidationTime < lastValidationTime) {
      throw new ConflictError(
        `Newer validation results already exist for file with ID ${fileId}`
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
      validationStatus,
    });
  });
}

/**
 * Convert metadata from the given validation results into dataset info to be saved in a file record.
 * @param validationResults - Validation results to get dataset info from.
 * @returns - Dataset info, or null if metadata is not present in the validation results.
 */
function getDatasetInfoFromValidationResults(
  validationResults: DatasetValidatorResults
): HCAAtlasTrackerDBFileDatasetInfo | null {
  const metadataSummary = validationResults.metadata_summary;
  if (metadataSummary === null) return null;
  return {
    assay: metadataSummary.assay,
    cellCount: metadataSummary.cell_count,
    disease: metadataSummary.disease,
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
  snsMessage: SNSMessage
): HCAAtlasTrackerDBFileValidationInfo {
  return {
    batchJobId: validationResults.batch_job_id,
    snsMessageId: snsMessage.MessageId,
    snsMessageTime: snsMessage.Timestamp,
  };
}
