import { UnauthorizedAWSResourceError } from "../apis/catalog/hca-atlas-tracker/aws/errors";

interface AWSResourceConfig {
  s3_buckets: string[];
  sns_topics: string[];
}

let cachedConfig: AWSResourceConfig | null = null;

export function getAWSResourceConfig(): AWSResourceConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configJson = process.env.AWS_RESOURCE_CONFIG;
  if (!configJson) {
    throw new Error("AWS_RESOURCE_CONFIG environment variable is required");
  }

  try {
    const parsed = JSON.parse(configJson);

    // Validate the parsed JSON has the expected structure
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.sns_topics) ||
      !Array.isArray(parsed.s3_buckets)
    ) {
      throw new Error(
        "AWS_RESOURCE_CONFIG must contain 'sns_topics' and 's3_buckets' arrays",
      );
    }

    cachedConfig = parsed as AWSResourceConfig;
    return cachedConfig;
  } catch (error) {
    throw new Error(
      `Invalid AWS_RESOURCE_CONFIG JSON format: ${String(error)}`,
    );
  }
}

/**
 * Validates SNS topic authorization and throws error if unauthorized
 * @param topicArn - The SNS topic ARN to validate
 * @throws UnauthorizedAWSResourceError if topic is not authorized
 */
export function validateSNSTopicAuthorization(topicArn: string): void {
  const config = getAWSResourceConfig();
  if (!config.sns_topics.includes(topicArn)) {
    throw new UnauthorizedAWSResourceError("SNS topic", topicArn);
  }
}

/**
 * Validates S3 bucket authorization and throws error if unauthorized
 * @param bucketName - The S3 bucket name to validate
 * @throws UnauthorizedAWSResourceError if bucket is not authorized
 */
export function validateS3BucketAuthorization(bucketName: string): void {
  const config = getAWSResourceConfig();
  if (!config.s3_buckets.includes(bucketName)) {
    throw new UnauthorizedAWSResourceError("S3 bucket", bucketName);
  }
}

// For testing - reset cached config
export function resetConfigCache(): void {
  cachedConfig = null;
}
