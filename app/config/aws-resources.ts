interface AWSResourceConfig {
    sns_topics: string[];
    s3_buckets: string[];
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
      if (!parsed || typeof parsed !== 'object' || 
          !Array.isArray(parsed.sns_topics) || 
          !Array.isArray(parsed.s3_buckets)) {
        throw new Error("AWS_RESOURCE_CONFIG must contain 'sns_topics' and 's3_buckets' arrays");
      }
      
      cachedConfig = parsed as AWSResourceConfig;
      return cachedConfig;
    } catch (error) {
      throw new Error(`Invalid AWS_RESOURCE_CONFIG JSON format: ${String(error)}`);
    }
  }
  
  export function isAuthorizedSNSTopic(topicArn: string): boolean {
    try {
      const config = getAWSResourceConfig();
      console.error(`DEBUG: Checking SNS topic authorization for: ${topicArn}`);
      console.error(`DEBUG: Authorized topics: ${JSON.stringify(config.sns_topics)}`);
      const isAuthorized = config.sns_topics.includes(topicArn);
      console.error(`DEBUG: Authorization result: ${isAuthorized}`);
      return isAuthorized;
    } catch (error) {
      console.error(`DEBUG: Error in SNS topic authorization: ${String(error)}`);
      return false;
    }
  }
  
  export function isAuthorizedS3Bucket(bucketName: string): boolean {
    try {
      const config = getAWSResourceConfig();
      console.error(`DEBUG: Checking S3 bucket authorization for: ${bucketName}`);
      console.error(`DEBUG: Authorized buckets: ${JSON.stringify(config.s3_buckets)}`);
      const isAuthorized = config.s3_buckets.includes(bucketName);
      console.error(`DEBUG: Authorization result: ${isAuthorized}`);
      return isAuthorized;
    } catch (error) {
      console.error(`DEBUG: Error in S3 bucket authorization: ${String(error)}`);
      return false;
    }
  }
  
  // For testing - reset cached config
  export function resetConfigCache(): void {
    cachedConfig = null;
  }