import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_DOWNLOAD_URL_EXPIRATION_TIME = 172800; // 48 hours

const s3 = new S3Client();

export function getDataBucketName(): string {
  const bucket = process.env.AWS_DATA_BUCKET;
  if (!bucket) throw new Error("S3 bucket not specified in environment");
  return bucket;
}

export async function getDownloadUrl(
  key: string,
  filename: string,
): Promise<string> {
  const bucket = getDataBucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    // Force browser download instead of inline display
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  return await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_DOWNLOAD_URL_EXPIRATION_TIME,
  });
}

/**
 * Fetch the body of an S3 object as a string. The SDK applies its default
 * retry policy (exponential backoff) for transient failures.
 * @param bucket - Bucket name.
 * @param key - Object key.
 * @returns Object body decoded as a UTF-8 string.
 */
export async function getObjectAsString(
  bucket: string,
  key: string,
): Promise<string> {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!response.Body) {
    throw new Error(`No body returned for s3://${bucket}/${key}`);
  }
  return await response.Body.transformToString();
}

/**
 * Delete an S3 object.
 * @param bucket - Bucket name.
 * @param key - Object key.
 */
export async function deleteObject(bucket: string, key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
