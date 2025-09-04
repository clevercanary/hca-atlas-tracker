import { SNSMessage } from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import { validateSNSTopicAuthorization } from "../config/aws-resources";
import { InvalidOperationError } from "../utils/api-handler";
import { httpGet } from "../utils/http";

/**
 * Handles SNS subscription lifecycle messages (SubscriptionConfirmation, UnsubscribeConfirmation)
 * @param message - The SNS subscription message
 * @throws UnauthorizedAWSResourceError if topic is not authorized
 * @throws InvalidOperationError if SubscribeURL is missing for confirmation
 */
export async function handleSNSSubscription(
  message: SNSMessage
): Promise<void> {
  // Verify the topic is authorized before processing
  validateSNSTopicAuthorization(message.TopicArn);

  switch (message.Type) {
    case "SubscriptionConfirmation":
      await confirmSubscription(message);
      break;
    case "UnsubscribeConfirmation":
      handleUnsubscribeConfirmation(message);
      break;
    default:
      throw new InvalidOperationError(
        `Unknown subscription message type: ${message.Type}`
      );
  }
}

/**
 * Confirms an SNS subscription by making a GET request to the SubscribeURL
 * @param message - The SNS SubscriptionConfirmation message
 * @throws InvalidOperationError if SubscribeURL is missing
 */
async function confirmSubscription(message: SNSMessage): Promise<void> {
  if (!message.SubscribeURL) {
    throw new InvalidOperationError(
      "SubscribeURL is required for subscription confirmation"
    );
  }

  console.log(`Confirming SNS subscription for topic: ${message.TopicArn}`);

  // Make GET request to confirm subscription using HTTP wrapper
  await httpGet(message.SubscribeURL, {
    timeout: 10000, // 10 second timeout
  });

  console.log(
    `Successfully confirmed SNS subscription for topic: ${message.TopicArn}`
  );
}

/**
 * Handles SNS unsubscribe confirmation messages
 * @param message - The SNS UnsubscribeConfirmation message
 */
function handleUnsubscribeConfirmation(message: SNSMessage): void {
  console.log(`SNS unsubscribe confirmed for topic: ${message.TopicArn}`);
  // Log the unsubscription for monitoring purposes
  // No action needed - AWS has already processed the unsubscription
}
