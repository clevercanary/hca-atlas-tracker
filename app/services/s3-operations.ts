import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_DOWNLOAD_URL_EXPIRATION_TIME = 172800; // 48 hours

const s3 = new S3Client();

function getBucket(): string {
  const bucket = process.env.DOWNLOAD_BUCKET;
  if (!bucket)
    throw new Error("S3 bucket for downloads not specified in environment");
  return bucket;
}

export async function getDownloadUrl(key: string): Promise<string> {
  const bucket = getBucket();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    // Force browser download instead of inline display
    ResponseContentDisposition: "attachment",
  });

  return await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_DOWNLOAD_URL_EXPIRATION_TIME,
  });
}
