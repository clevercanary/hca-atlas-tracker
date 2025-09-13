import {
  DatasetValidatorResults,
  datasetValidatorResultsSchema,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  HCAAtlasTrackerDBFileDatasetInfo,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { addValidationResultsToFile } from "../data/files";
import { InvalidOperationError } from "../utils/api-handler";

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

  const datasetInfo = getDatasetInfoFromValidationResults(validationResults);

  await addValidationResultsToFile({
    datasetInfo,
    fileId: validationResults.file_id,
    integrityStatus:
      validationResults.integrity_status ?? INTEGRITY_STATUS.PENDING,
    snsMessageId: snsMessage.MessageId,
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
