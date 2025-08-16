# AWS Resource Configuration Setup

## Local Development Setup

Add the following to your `.env.local` file:

```bash
# AWS Resource Configuration (JSON format)
# This defines which SNS topics and S3 buckets are authorized to send notifications
AWS_RESOURCE_CONFIG={"sns_topics":["arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications"],"s3_buckets":["hca-atlas-tracker-data-dev","hca-atlas-tracker-data-local"]}
```

## Configuration Structure

The `AWS_RESOURCE_CONFIG` environment variable should contain a JSON object with:

```json
{
  "sns_topics": [
    "arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications-dev",
    "arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications-prod"
  ],
  "s3_buckets": [
    "hca-atlas-tracker-data-dev",
    "hca-atlas-tracker-data-prod",
    "hca-atlas-tracker-data-local"
  ]
}
```

## Environment-Specific Examples

### Development

```bash
AWS_RESOURCE_CONFIG={"sns_topics":["arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications-dev"],"s3_buckets":["hca-atlas-tracker-data-dev"]}
```

### Production

```bash
AWS_RESOURCE_CONFIG={"sns_topics":["arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications-prod"],"s3_buckets":["hca-atlas-tracker-data-prod"]}
```

### Local Testing

```bash
AWS_RESOURCE_CONFIG={"sns_topics":["arn:aws:sns:us-east-1:123456789012:hca-atlas-tracker-s3-notifications"],"s3_buckets":["hca-atlas-tracker-data-dev","hca-atlas-tracker-data-local"]}
```

## Security Benefits

This configuration provides:

- **SNS Topic Filtering**: Only notifications from authorized SNS topics are processed
- **S3 Bucket Allowlist**: Only files from authorized S3 buckets are ingested
- **Cross-Account Protection**: Prevents unauthorized AWS accounts from triggering the endpoint
- **Environment Isolation**: Different configurations for dev/prod environments

## Error Responses

- **Unauthorized SNS Topic**: HTTP 403 with `"Unauthorized SNS topic"`
- **Unauthorized S3 Bucket**: Records from unauthorized buckets are skipped (HTTP 200 with `recordsProcessed: 0`)

## Configuration Management

The configuration is:

- **Cached in memory** for performance
- **Validated at startup** to ensure proper JSON format
- **Environment-specific** via different JSON values
- **Centrally managed** through AWS Secrets Manager in production
