import { NextApiRequest, NextApiResponse } from "next";
import { doTransaction } from "../../../app/services/database";
import { isAuthorizedSNSTopic, isAuthorizedS3Bucket } from "../../../app/config/aws-resources";

// SNS message validator for authentication
const MessageValidator = require('sns-validator');

interface S3EventRecord {
  eventVersion: string;
  eventSource: string;
  eventTime: string;
  eventName: string;
  s3: {
    bucket: {
      name: string;
    };
    object: {
      key: string;
      size: number;
      eTag: string;
      versionId?: string;
    };
  };
}

interface S3Event {
  Records: S3EventRecord[];
}

interface SNSMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  UnsubscribeURL?: string;
  SubscribeURL?: string;
  Token?: string;
}

function isValidS3Event(payload: any): payload is S3Event {
  return (
    payload &&
    Array.isArray(payload.Records) &&
    payload.Records.length > 0 &&
    payload.Records.every((record: any) => 
      record.eventSource === "aws:s3" &&
      record.s3 &&
      record.s3.bucket &&
      record.s3.object &&
      typeof record.s3.bucket.name === "string" &&
      typeof record.s3.object.key === "string" &&
      typeof record.s3.object.eTag === "string" &&
      typeof record.s3.object.size === "number"
    )
  );
}

function isValidSNSMessage(payload: any): payload is SNSMessage {
  return (
    payload &&
    typeof payload.Type === "string" &&
    typeof payload.MessageId === "string" &&
    typeof payload.TopicArn === "string" &&
    typeof payload.Message === "string" &&
    typeof payload.Signature === "string" &&
    typeof payload.SigningCertURL === "string"
  );
}

function extractSHA256FromS3Object(s3Object: any): string {
  const sha256 = s3Object.userMetadata?.["source-sha256"];
  if (!sha256 || typeof sha256 !== "string") {
    throw new Error("SHA256 metadata is required for file integrity validation");
  }
  return sha256;
}

async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
  return new Promise((resolve, reject) => {
    const validator = new MessageValidator();
    
    validator.validate(message, (err: Error | null, validatedMessage: SNSMessage) => {
      if (err) {
        reject(new Error(`SNS signature validation failed: ${err.message}`));
        return;
      }

      try {
        // Parse the S3 event from the SNS message
        const s3Event = JSON.parse(validatedMessage.Message);
        resolve(s3Event);
      } catch (parseError) {
        reject(new Error("Failed to parse S3 event from SNS message"));
      }
    });
  });
}

async function saveFileRecord(record: S3EventRecord): Promise<void> {
  const { bucket, object } = record.s3;
  
  const fileInfo = {
    eventTime: record.eventTime,
    eventName: record.eventName,
    contentType: null,
  };

  // Extract and validate SHA256 from S3 object metadata
  const sha256 = extractSHA256FromS3Object(object);

  // IDEMPOTENCY STRATEGY: PostgreSQL ON CONFLICT
  // 
  // We use a single atomic database operation that handles all cases:
  // 1. New file version: INSERT succeeds, record created
  // 2. Duplicate notification: INSERT conflicts, UPDATE executed instead
  // 3. ETag mismatch: UPDATE condition fails, no rows returned (indicates corruption)
  //
  // This approach provides several key benefits:
  // - ATOMIC: Single operation, no race conditions between concurrent requests
  // - EFFICIENT: No separate existence checks or multiple queries needed
  // - SAFE: Database constraint enforcement prevents data corruption
  // - INFORMATIVE: Returns metadata about whether record was inserted vs updated
  //
  // Alternative approaches we rejected:
  // - Pre-read + conditional insert: Race conditions, multiple queries, performance impact
  // - Application-level locking: Complex, doesn't scale, potential deadlocks
  // - Ignore duplicates: Loses important ETag mismatch detection
  await doTransaction(async (transaction) => {
    // STEP 1: Mark all previous versions of this file as no longer latest
    // This ensures only one version per (bucket, key) has is_latest = true
    await transaction.query(
      `UPDATE hat.files SET is_latest = FALSE WHERE bucket = $1 AND key = $2`,
      [bucket.name, object.key]
    );

    // STEP 2: Insert new version with ON CONFLICT handling
    // The unique constraint on (bucket, key, version_id) will trigger ON CONFLICT
    // if we receive a duplicate notification for the same S3 object version
    const result = await transaction.query(
      `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, file_info, sha256_client, integrity_status, status, is_latest)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
       
       -- ON CONFLICT: Handle duplicate notifications gracefully
       -- This triggers when (bucket, key, version_id) already exists
       ON CONFLICT (bucket, key, version_id) 
       DO UPDATE SET 
         etag = files.etag,  -- Keep existing ETag (no change)
         size_bytes = files.size_bytes,  -- Keep existing values
         file_info = files.file_info,
         is_latest = TRUE,  -- Ensure this version is marked as latest
         updated_at = CURRENT_TIMESTAMP
         
       -- CRITICAL: Only update if ETags match
       -- This WHERE clause provides data integrity protection:
       -- - If ETags match: Same S3 object, safe to update (idempotent)
       -- - If ETags differ: Potential corruption, reject update (no rows returned)
       WHERE files.etag = EXCLUDED.etag
       
       -- RETURNING clause provides operation metadata:
       -- - xmax = 0: Record was INSERTed (new file version)
       -- - xmax > 0: Record was UPDATEd (duplicate notification)
       RETURNING 
         (CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END) as operation,
         etag`,
      [
        bucket.name,
        object.key,
        object.versionId || null,
        object.eTag,
        object.size,
        JSON.stringify(fileInfo),
        sha256,
        "pending",
        "uploaded"
      ]
    );

    // STEP 3: Handle the three possible outcomes
    
    // CASE 1: No rows returned = ETag mismatch detected
    // This happens when ON CONFLICT triggered but WHERE clause failed
    // Indicates potential data corruption or AWS infrastructure issue
    if (result.rows.length === 0) {
      // Get the existing ETag for detailed error reporting
      const existingRecord = await transaction.query(
        `SELECT etag FROM hat.files WHERE bucket = $1 AND key = $2 AND version_id = $3`,
        [bucket.name, object.key, object.versionId || null]
      );
      
      const existingETag = existingRecord.rows[0]?.etag;
      const errorMsg = `ETag mismatch for ${bucket.name}/${object.key} (version: ${object.versionId || 'null'}): existing=${existingETag}, new=${object.eTag}`;
      console.error(errorMsg);
      throw new Error(`ETag mismatch detected - possible data corruption or AWS infrastructure issue`);
    }

    // CASE 2 & 3: Success - log the operation type for monitoring
    const operation = result.rows[0]?.operation;
    
    if (operation === 'inserted') {
      // New file version successfully created
      console.error(`New file record created for ${bucket.name}/${object.key}`);
    } else if (operation === 'updated') {
      // Duplicate notification handled idempotently
      console.error(`Duplicate notification for ${bucket.name}/${object.key} - ignoring`);
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Expect SNS message format
    if (!isValidSNSMessage(req.body)) {
      return res.status(400).json({ error: "Invalid SNS message payload" });
    }

    // Validate SNS signature and extract S3 event
    let s3Event: S3Event;
    try {
      s3Event = await validateSNSMessage(req.body);
    } catch (validationError) {
      console.error("SNS signature validation failed:", validationError);
      return res.status(401).json({ error: "SNS signature validation failed" });
    }

    // Validate SNS topic authorization
    if (!isAuthorizedSNSTopic(req.body.TopicArn)) {
      console.error(`Unauthorized SNS topic: ${req.body.TopicArn}`);
      return res.status(403).json({ 
        error: 'Unauthorized SNS topic',
        topicArn: req.body.TopicArn 
      });
    }

    // Validate S3 event structure and SHA256 metadata
    if (!isValidS3Event(s3Event)) {
      console.error("S3 event validation failed: Missing or invalid SHA256 metadata");
      return res.status(400).json({ error: "SHA256 metadata is required for file integrity validation" });
    }

    // STRICT MODE: Validate ALL S3 buckets are authorized before processing ANY records
    // This ensures we reject the entire request if any bucket is unauthorized
    const unauthorizedBuckets: string[] = [];
    
    for (const record of s3Event.Records) {
      const bucketName = record.s3.bucket.name;
      if (!isAuthorizedS3Bucket(bucketName)) {
        unauthorizedBuckets.push(bucketName);
      }
    }

    // If any unauthorized buckets found, reject the entire request
    if (unauthorizedBuckets.length > 0) {
      console.error(`Unauthorized S3 buckets detected: ${unauthorizedBuckets.join(', ')}`);
      return res.status(403).json({ 
        error: 'Unauthorized S3 buckets',
        unauthorizedBuckets,
        message: 'Request rejected due to unauthorized bucket access'
      });
    }

    // All buckets are authorized - proceed with processing all records
    let recordsProcessed = 0;
    const errors: string[] = [];

    for (const record of s3Event.Records) {
      try {
        await saveFileRecord(record);
        recordsProcessed++;
      } catch (error: any) {
        // Handle SHA256 validation errors
        if (error.message.includes("SHA256")) {
          console.error("SHA256 validation error:", error.message);
          return res.status(400).json({ error: error.message });
        }
        // Re-throw other errors to be handled by outer catch
        throw error;
      }
    }

    return res.status(200).json({ 
      message: "S3 notification processed successfully",
      recordsProcessed
    });

  } catch (error) {
    console.error("Error processing S3 notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
