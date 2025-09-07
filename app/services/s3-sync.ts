import {
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3EventRecord } from "../apis/catalog/hca-atlas-tracker/aws/entities";
import { saveFileRecord } from "./s3-notification";

const HEAD_BATCH_SIZE = 20;

function getBucket(): string {
  const bucket = process.env.AWS_DATA_BUCKET;
  if (!bucket) throw new Error("S3 bucket not specified in environment");
  return bucket;
}

export async function syncFilesFromS3(): Promise<void> {
  const bucket = getBucket();

  const s3 = new S3Client();

  const keys = await getBucketFileKeys(bucket, s3);
  const eventRecords = await getSyntheticEventRecordsForObjects(
    bucket,
    keys,
    s3
  );

  await saveFilesFromEventRecords(eventRecords);
}

async function saveFilesFromEventRecords(
  records: S3EventRecord[]
): Promise<void> {
  for (const record of records) {
    try {
      await saveFileRecord(record, `SYNTHETIC-${crypto.randomUUID()}`);
    } catch (e) {
      console.error(
        `S3 sync: Encountered error while saving file for s3://${record.s3.bucket.name}/${record.s3.object.key}`
      );
      console.error(e);
    }
  }
}

async function getSyntheticEventRecordsForObjects(
  bucket: string,
  keys: string[],
  s3: S3Client
): Promise<S3EventRecord[]> {
  const records: S3EventRecord[] = [];
  for (let i = 0; i < keys.length; i += HEAD_BATCH_SIZE) {
    console.log(
      `S3 sync: Getting page ${
        Math.floor(i / HEAD_BATCH_SIZE) + 1
      } of objects info`
    );
    const batchKeys = keys.slice(i, i + HEAD_BATCH_SIZE);
    const batchRecords = await Promise.all(
      batchKeys.map(async (key) => {
        const headResult = await s3.send(
          new HeadObjectCommand({ Bucket: bucket, Key: key })
        );
        return makeSyntheticEventRecordFromHeadResult(headResult, key, bucket);
      })
    );
    for (const record of batchRecords) {
      if (record === null) continue;
      records.push(record);
    }
  }
  console.log(`S3 sync: Got objects info`);
  return records;
}

function makeSyntheticEventRecordFromHeadResult(
  result: HeadObjectCommandOutput,
  key: string,
  bucket: string
): S3EventRecord | null {
  if (!result.ETag) {
    console.warn(
      `S3 sync: No ETag received for s3://${bucket}/${key} -- skipping`
    );
    return null;
  }
  return {
    eventName: "ObjectCreated:*",
    eventSource: "aws:s3",
    eventTime: (result.LastModified ?? new Date()).toISOString(),
    eventVersion: "2.1",
    s3: {
      bucket: { name: bucket },
      object: {
        eTag: result.ETag,
        key,
        size: result.ContentLength ?? 0,
        versionId: result.VersionId ?? "",
      },
      s3SchemaVersion: "1.0",
    },
  };
}

async function getBucketFileKeys(
  bucket: string,
  s3: S3Client
): Promise<string[]> {
  const keys: string[] = [];
  let skippedCount = 0;

  let pageNumber = 1;
  let continuationToken: string | undefined;

  do {
    console.log(`S3 sync: Getting page ${pageNumber} of object list`);

    const listResult: ListObjectsV2CommandOutput = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    );

    for (const item of listResult.Contents ?? []) {
      const key = item.Key;
      if (!key) {
        skippedCount++;
        continue;
      }
      // Ignore files named `.keep`
      if (/(?:^|\/)\.keep$/.test(key)) continue;
      keys.push(key);
    }

    continuationToken = listResult.IsTruncated
      ? listResult.NextContinuationToken
      : undefined;

    pageNumber++;
  } while (continuationToken);

  if (skippedCount > 0)
    console.warn(`S3 sync: Skipped ${skippedCount} objects without keys`);

  console.log(`S3 sync: Got object list`);

  return keys;
}
