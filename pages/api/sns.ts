import { NextApiRequest } from "next";
import getRawBody from "raw-body";
import MessageValidator from "sns-validator";
import { SNSSignatureValidationError } from "../../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  SNSMessage,
  snsMessageSchema,
} from "../../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { METHOD } from "../../app/common/entities";
import { dispatchSNSNotification } from "../../app/services/sns-dispatcher";
import { handleSNSSubscription } from "../../app/services/sns-subscription";
import {
  handler,
  InvalidOperationError,
  method,
} from "../../app/utils/api-handler";

/**
 * Validates the incoming SNS request and extracts the message
 * @param req - The Next.js API request object
 * @returns Promise containing the validated SNS message
 */
async function validateSNSRequest(req: NextApiRequest): Promise<SNSMessage> {
  // Get raw body for SNS signature verification
  const body = await getRequestBody(req);

  // Validate SNS message format using Yup schema
  const snsMessage = await snsMessageSchema.validate(body);

  // Validate SNS signature
  await validateSNSSignature(snsMessage);

  return snsMessage;
}

/**
 * Gets request body handling both production (raw stream) and test environments
 * @param req - The Next.js API request object
 * @returns Promise resolving to the parsed request body
 * @throws InvalidOperationError if request body is missing or malformed
 */
async function getRequestBody(req: NextApiRequest): Promise<unknown> {
  // In test environment, req.body is already parsed by node-mocks-http
  if (req.body !== undefined) {
    return req.body;
  }

  // Check for missing Content-Length header (indicates no body)
  const contentLength = req.headers["content-length"];
  if (!contentLength || contentLength === "0") {
    throw new InvalidOperationError("Request body is required");
  }

  // In production with bodyParser: false, read from raw stream with timeout
  try {
    const rawBuffer = await Promise.race([
      getRawBody(req, {
        encoding: "utf8",
        length: contentLength,
        limit: "1mb",
      }),
      // Timeout after 10 seconds to prevent hanging
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request body timeout")), 10000)
      ),
    ]);

    if (!rawBuffer || rawBuffer.length === 0) {
      throw new InvalidOperationError("Request body is empty");
    }

    return JSON.parse(rawBuffer);
  } catch (error) {
    if (error instanceof Error && error.message === "Request body timeout") {
      throw new InvalidOperationError("Request body read timeout");
    }
    throw new InvalidOperationError("Failed to parse request body");
  }
}

/**
 * Validates the cryptographic signature of an SNS message
 * @param message - The SNS message to validate
 * @throws SNSSignatureValidationError if the SNS signature is invalid (401)
 * @throws InvalidOperationError if the message is malformed (400)
 */
async function validateSNSSignature(message: SNSMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    const validator = new MessageValidator();

    // Cast to compatible type for sns-validator library
    validator.validate(
      message as Record<string, unknown>,
      (err: Error | null, validatedMessage?: Record<string, unknown>) => {
        if (err) {
          // SNS signature validation failure → 401 Unauthorized
          reject(new SNSSignatureValidationError());
          return;
        }

        if (!validatedMessage) {
          // Malformed SNS message → 400 Bad Request
          reject(
            new InvalidOperationError("SNS validation returned no message")
          );
          return;
        }

        resolve();
      }
    );
  });
}

/**
 * Centralized SNS Webhook Handler
 *
 * Processes all AWS SNS messages sent to this endpoint.
 * Routes messages by Type (SubscriptionConfirmation, Notification, etc.)
 * and delegates to appropriate service handlers.
 *
 * All error handling is managed by the centralized handler wrapper which maps errors
 * to appropriate HTTP status codes based on error type inheritance.
 *
 * @route POST /api/sns
 * @param req - Next.js API request containing SNS message in body
 * @param res - Next.js API response object
 * @returns 200 on successful processing
 * @note Error responses are handled by centralized error handler based on thrown error types
 */
export default handler(method(METHOD.POST), async (req, res) => {
  const snsMessage = await validateSNSRequest(req);

  // Route by message type
  switch (snsMessage.Type) {
    case "SubscriptionConfirmation":
    case "UnsubscribeConfirmation":
      // Handle subscription lifecycle messages
      console.log(
        `Processing ${snsMessage.Type} for topic: ${snsMessage.TopicArn}`
      );
      await handleSNSSubscription(snsMessage);
      break;

    case "Notification":
      // Handle notification messages
      console.log(`Processing notification from topic: ${snsMessage.TopicArn}`);
      await dispatchSNSNotification(
        snsMessage as Parameters<typeof dispatchSNSNotification>[0]
      );
      break;

    default:
      throw new InvalidOperationError(
        `Unknown SNS message type: ${snsMessage.Type}`
      );
  }

  res.status(200).end();
});

// Disable Next.js body parsing to preserve raw body for SNS signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
