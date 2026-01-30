import { UnauthorizedAWSResourceError } from "../apis/catalog/hca-atlas-tracker/aws/errors";
import { SNSMessage } from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import { validateSNSTopicAuthorization } from "../config/aws-resources";
import { processS3NotificationMessage } from "./s3-notification";
import { processValidationResultsMessage } from "./validation-results-notification";

/**
 * Dispatches SNS notification messages to appropriate handlers based on topic
 * @param message - The SNS notification message
 * @throws UnauthorizedAWSResourceError if topic is not authorized
 */
export async function dispatchSNSNotification(
  message: SNSMessage,
): Promise<void> {
  // Validate topic authorization
  validateSNSTopicAuthorization(message.TopicArn);

  // Route to appropriate handler based on topic

  if (isS3NotificationTopic(message.TopicArn)) {
    await processS3NotificationMessage(message);
    return;
  }

  if (isValidationResultsTopic(message.TopicArn)) {
    await processValidationResultsMessage(message);
    return;
  }

  throw new UnauthorizedAWSResourceError("SNS topic", message.TopicArn);
}

/**
 * Determines if a topic ARN is for S3 notifications
 * @param topicArn - The SNS topic ARN
 * @returns True if this is an S3 notification topic
 */
function isS3NotificationTopic(topicArn: string): boolean {
  // S3 notification topics typically contain "s3" in their name
  // This can be made more specific based on your naming conventions
  return (
    topicArn.includes("s3-notifications") || topicArn.includes("s3-events")
  );
}

/**
 * Determines if a topic ARN is for dataset validator results
 * @param topicArn - The SNS topic ARN
 * @returns True if this is the validation results topic
 */
function isValidationResultsTopic(topicArn: string): boolean {
  return topicArn.includes("validation-results");
}
