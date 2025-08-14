import { NextApiRequest } from "next";
import MessageValidator from "sns-validator";
import { SNSSignatureValidationError } from "../../../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  S3Event,
  SNSMessage,
  snsMessageSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { METHOD } from "../../../app/common/entities";
import { processS3Record } from "../../../app/services/s3-notification";
import {
  handler,
  InvalidOperationError,
  method,
} from "../../../app/utils/api-handler";

/**
 * Validates the incoming request and extracts the S3 event
 * @param req - The Next.js API request object
 * @returns Promise containing both the validated SNS message and extracted S3 event
 */
async function validateRequest(req: NextApiRequest): Promise<{
  s3Event: S3Event;
  snsMessage: SNSMessage;
}> {
  // Validate SNS message format using Yup schema
  const snsMessage = await snsMessageSchema.validate(req.body);

  // Validate SNS signature and extract S3 event
  const s3Event = await validateSNSMessage(snsMessage);
  return { s3Event, snsMessage };
}

export default handler(method(METHOD.POST), async (req, res) => {
  // Extract and validate request
  const { s3Event, snsMessage } = await validateRequest(req);

  // Process S3 record
  await processS3Record(s3Event, snsMessage);

  // Return success response
  res.status(200).end();
});

async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
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

        try {
          // Parse the S3 event from the SNS message
          const s3Event = JSON.parse(validatedMessage.Message as string);
          resolve(s3Event);
        } catch (parseError) {
          // Malformed JSON in SNS message → 400 Bad Request
          reject(
            new InvalidOperationError(
              "Failed to parse S3 event from SNS message"
            )
          );
        }
      }
    );
  });
}
