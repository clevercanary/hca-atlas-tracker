import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseS3KeyPath } from "./s3-notification";

const PRESIGNED_DOWNLOAD_URL_EXPIRATION_TIME = 172800; // 48 hours

const s3 = new S3Client();

export function getDataBucketName(): string {
  const bucket = process.env.AWS_DATA_BUCKET;
  if (!bucket) throw new Error("S3 bucket not specified in environment");
  return bucket;
}

export async function getDownloadUrl(key: string): Promise<string> {
  const { filename } = parseS3KeyPath(key);

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
