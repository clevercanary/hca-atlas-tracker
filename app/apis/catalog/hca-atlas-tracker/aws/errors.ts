// AWS-specific custom error classes
// These errors are used for AWS S3/SNS event processing and validation

import {
  ConflictError,
  ForbiddenError,
  UnauthenticatedError,
} from "../../../../utils/api-handler";

/**
 * Error thrown when S3 object ETag doesn't match expected value
 * This indicates potential data corruption or integrity issues
 * Maps to HTTP 409 Conflict
 */
export class ETagMismatchError extends ConflictError {
  constructor(
    bucket: string,
    key: string,
    versionId: string | null,
    existingETag: string,
    newETag: string
  ) {
    super(
      `ETag mismatch for ${bucket}/${key} (version: ${
        versionId || "null"
      }): existing=${existingETag}, new=${newETag}`
    );
    this.name = "ETagMismatchError";
  }
}

/**
 * Error thrown when SNS message signature validation fails
 * Maps to HTTP 401 Unauthorized
 */
export class SNSSignatureValidationError extends UnauthenticatedError {
  name = "SNSSignatureValidationError";

  constructor() {
    super("SNS signature validation failed");
  }
}

/**
 * Error thrown when accessing unauthorized AWS resources (SNS topics, S3 buckets)
 * Maps to HTTP 403 Forbidden
 */
export class UnauthorizedAWSResourceError extends ForbiddenError {
  name = "UnauthorizedAWSResourceError";

  constructor(resourceType: string, resourceArn: string) {
    super(`Unauthorized ${resourceType}: ${resourceArn}`);
  }
}
