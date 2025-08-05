import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../app/services/database";

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
        
        if (!isValidS3Event(s3Event)) {
          reject(new Error("Invalid S3 event in SNS message"));
          return;
        }

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

  // Single database operation that handles all cases
  const result = await query(
    `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, file_info, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (bucket, key, version_id) 
     DO UPDATE SET 
       etag = files.etag,  -- Keep existing ETag (no change)
       size_bytes = files.size_bytes,  -- Keep existing values
       file_info = files.file_info,
       updated_at = CURRENT_TIMESTAMP
     WHERE files.etag = EXCLUDED.etag  -- Only update if ETags match
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
      "uploaded"
    ]
  );

  // Check if we got a result back
  if (result.rows.length === 0) {
    // No rows returned means ON CONFLICT happened but WHERE clause failed
    // This indicates an ETag mismatch - get the existing ETag for error message
    const existingRecord = await query(
      `SELECT etag FROM hat.files WHERE bucket = $1 AND key = $2 AND version_id = $3`,
      [bucket.name, object.key, object.versionId || null]
    );
    
    const existingETag = existingRecord.rows[0]?.etag;
    const errorMsg = `ETag mismatch for ${bucket.name}/${object.key} (version: ${object.versionId || 'null'}): existing=${existingETag}, new=${object.eTag}`;
    console.error(errorMsg);
    throw new Error(`ETag mismatch detected - possible data corruption or AWS infrastructure issue`);
  }

  const operation = result.rows[0]?.operation;
  
  if (operation === 'inserted') {
    console.log(`New file record created for ${bucket.name}/${object.key}`);
  } else if (operation === 'updated') {
    console.log(`Duplicate notification for ${bucket.name}/${object.key} - ignoring`);
  }
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

    // Process each S3 event record
    for (const record of s3Event.Records) {
      await saveFileRecord(record);
    }

    return res.status(200).json({ 
      message: "S3 notification processed successfully",
      recordsProcessed: s3Event.Records.length
    });

  } catch (error) {
    console.error("Error processing S3 notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
