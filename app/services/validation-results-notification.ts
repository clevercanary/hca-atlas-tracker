import { InvalidOperationError } from "../utils/api-handler";
import { DatasetValidatorResults, datasetValidatorResultsSchema, SNSMessage } from "../apis/catalog/hca-atlas-tracker/aws/schemas";

/**
 * Processes an SNS notification message containing dataset validation results
 * @param snsMessage - The authorized SNS message containing validation results
 * @throws InvalidOperationError if the SNS message doesn't contain a valid validation results message
 */
export async function processValidationResultsMessage(
  snsMessage: SNSMessage
): Promise<void> {
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

  await processValidationResults(validationResults);
}

async function processValidationResults(
  validationResults: DatasetValidatorResults
): Promise<void> {}
