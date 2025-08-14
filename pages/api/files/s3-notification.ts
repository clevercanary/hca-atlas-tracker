import { NextApiRequest } from "next";
import MessageValidator from "sns-validator";
import {
  ETagMismatchError,
  InvalidS3KeyFormatError,
  SNSSignatureValidationError,
  UnknownFolderTypeError,
} from "../../../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  S3Event,
  S3EventRecord,
  s3EventSchema,
  SNSMessage,
  snsMessageSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { METHOD } from "../../../app/common/entities";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../../../app/config/aws-resources";
import { doTransaction, query } from "../../../app/services/database";
import {
  handler,
  InvalidOperationError,
  method,
} from "../../../app/utils/api-handler";

function extractSHA256FromS3Object(
  s3Object: S3EventRecord["s3"]["object"]
): string {
  // SHA256 validation is now handled by Yup schema
  // This function just extracts the validated value
  return s3Object.userMetadata["source-sha256"];
}

// Parsed S3 key path components
interface S3KeyPathComponents {
  atlasName: string; // e.g., 'gut-v1'
  filename: string; // e.g., 'file.h5ad'
  folderType: string; // e.g., 'source-datasets', 'integrated-objects', 'manifests'
  network: string; // e.g., 'bio_network'
}

// Parse S3 key path into standardized components
// Expected format: bio_network/atlas-name/folder-type/filename
function parseS3KeyPath(s3Key: string): S3KeyPathComponents {
  const pathParts = s3Key.split("/");

  if (pathParts.length < 4) {
    throw new InvalidS3KeyFormatError(s3Key);
  }

  return {
    atlasName: pathParts[1],
    filename: pathParts[pathParts.length - 1], // Last segment
    folderType: pathParts[pathParts.length - 2], // Second to last segment
    network: pathParts[0],
  };
}

function determineFileType(s3Key: string): string {
  const { folderType } = parseS3KeyPath(s3Key);

  switch (folderType) {
    case "source-datasets":
      return "source_dataset";
    case "integrated-objects":
      return "integrated_object";
    case "manifests":
      return "ingest_manifest";
    default:
      throw new UnknownFolderTypeError(folderType);
  }
}

// Parse S3 atlas name (e.g., 'gut-v1', 'retina-v1-1') into base name and version
// S3 format supports: 'name-v1' (v1.0), 'name-v1-1' (v1.1), 'name-v2-3' (v2.3)
function parseS3AtlasName(s3AtlasName: string): {
  atlasBaseName: string;
  s3Version: string;
} {
  // Match patterns like 'gut-v1' or 'gut-v1-1' (for v1.1)
  const versionMatch = s3AtlasName.match(/^(.+)-v(\d+(?:-\d+)*)$/);

  if (!versionMatch) {
    throw new Error(
      `Invalid S3 atlas name format: ${s3AtlasName}. Expected format: name-v1 or name-v1-1`
    );
  }

  const [, atlasBaseName, s3Version] = versionMatch;
  return { atlasBaseName, s3Version };
}

// Convert parsed S3 version to database version format
// Input: '1' -> DB: '1.0', Input: '1-1' -> DB: '1.1', Input: '2-3' -> DB: '2.3'
// Note: The 'v' prefix has already been stripped by parseS3AtlasName
function convertS3VersionToDbVersion(s3Version: string): string {
  if (s3Version.includes("-")) {
    // Convert '1-1' to '1.1'
    return s3Version.replace("-", ".");
  } else {
    // Convert '1' to '1.0'
    return s3Version + ".0";
  }
}

async function determineAtlasId(
  s3Key: string,
  fileType: string
): Promise<string | null> {
  // Source datasets don't use atlas_id, they use source_study_id
  if (fileType === "source_dataset") {
    return null;
  }

  const { atlasName, network } = parseS3KeyPath(s3Key);

  // Parse S3 atlas name into base name and version
  const { atlasBaseName, s3Version } = parseS3AtlasName(atlasName);

  // Convert S3 version to database version format
  const dbVersion = convertS3VersionToDbVersion(s3Version);

  // Look up atlas by network and version, then filter by shortName match
  // We need to do a case-insensitive match since S3 names may have different casing
  // Also check for both version formats: "1" and "1.0" since databases might store either
  const versionWithoutDecimal = dbVersion.replace(".0", "");

  const result = await query(
    `SELECT id, overview->>'shortName' as short_name, overview->>'version' as version
     FROM hat.atlases 
     WHERE overview->>'network' = $1 
     AND (overview->>'version' = $2 OR overview->>'version' = $3)
     AND LOWER(overview->>'shortName') = LOWER($4)
     ORDER BY 
       CASE WHEN overview->>'version' = $3 THEN 1 ELSE 2 END,
       overview->>'version'`,
    [network, dbVersion, versionWithoutDecimal, atlasBaseName]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `Atlas not found for network: ${network}, shortName: ${atlasBaseName}, version: ${dbVersion} or ${versionWithoutDecimal} (from S3 path: ${atlasName})`
    );
  }

  return result.rows[0].id;
}

async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
  return new Promise((resolve, reject) => {
    const validator = new MessageValidator();

    // Cast to compatible type for sns-validator library
    validator.validate(
      message as Record<string, unknown>,
      (err: Error | null, validatedMessage?: Record<string, unknown>) => {
        if (err) {
          // SNS signature validation failure → 401 Unauthorized
          reject(new SNSSignatureValidationError());
          return;
        }

        if (!validatedMessage) {
          // Malformed SNS message → 400 Bad Request
          reject(
            new InvalidOperationError("SNS validation returned no message")
          );
          return;
        }

        try {
          // Parse the S3 event from the SNS message
          const s3Event = JSON.parse(validatedMessage.Message as string);
          resolve(s3Event);
        } catch (parseError) {
          // Malformed JSON in SNS message → 400 Bad Request
          reject(
            new InvalidOperationError(
              "Failed to parse S3 event from SNS message"
            )
          );
        }
      }
    );
  });
}

async function saveFileRecord(record: S3EventRecord): Promise<void> {
  const { bucket, object } = record.s3;

  const eventInfo = {
    eventName: record.eventName,
    eventTime: record.eventTime,
  };

  // Extract SHA256 from validated S3 object metadata
  const sha256 = extractSHA256FromS3Object(object);

  // Determine file type from S3 key path structure
  const fileType = determineFileType(object.key);

  // Determine atlas ID for integrated objects and ingest manifests
  const atlasId = await determineAtlasId(object.key, fileType);

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
      `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_study_id, atlas_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NULL, $11)
       
       -- ON CONFLICT: Handle duplicate notifications gracefully
       -- This triggers when (bucket, key, version_id) already exists
       ON CONFLICT (bucket, key, version_id) 
       DO UPDATE SET 
         etag = files.etag,  -- Keep existing ETag (no change)
         size_bytes = files.size_bytes,  -- Keep existing values
         event_info = files.event_info,
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
        JSON.stringify(eventInfo),
        sha256,
        "pending",
        "uploaded",
        fileType,
        atlasId,
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
      const errorMsg = `ETag mismatch for ${bucket.name}/${
        object.key
      } (version: ${
        object.versionId || "null"
      }): existing=${existingETag}, new=${object.eTag}`;
      console.error(errorMsg);
      throw new ETagMismatchError(
        bucket.name,
        object.key,
        object.versionId || null,
        existingETag,
        object.eTag
      );
    }

    // CASE 2 & 3: Success - log the operation type for monitoring
    const operation = result.rows[0]?.operation;

    if (operation === "inserted") {
      // New file version successfully created
      console.log(`New file record created for ${bucket.name}/${object.key}`);
    } else if (operation === "updated") {
      // Duplicate notification handled idempotently
      console.log(
        `Duplicate notification for ${bucket.name}/${object.key} - ignoring`
      );
    }
  });
}

/**
 * Validates the incoming request and extracts the S3 event
 * @param req - The Next.js API request object
 * @returns Promise containing both the validated SNS message and extracted S3 event
 */
async function validateRequest(req: NextApiRequest): Promise<{
  s3Event: S3Event;
  snsMessage: SNSMessage;
}> {
  // Validate SNS message format using Yup schema
  const snsMessage = await snsMessageSchema.validate(req.body);

  // Validate SNS signature and extract S3 event
  const s3Event = await validateSNSMessage(snsMessage);
  return { s3Event, snsMessage };
}

/**
 * Processes the S3 record from the event
 * @param s3Event - The validated S3 event containing a single record
 * @param snsMessage - The validated SNS message containing the S3 event
 * @throws InvalidOperationError if multiple records are present
 */
async function processS3Record(
  s3Event: S3Event,
  snsMessage: SNSMessage
): Promise<void> {
  // Authorize SNS topic
  validateSNSTopicAuthorization(snsMessage.TopicArn);

  // S3 ObjectCreated events should contain exactly one record per SNS message
  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError(
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`
    );
  }

  // Validate S3 event structure and metadata (including SHA256)
  s3EventSchema.validateSync(s3Event);

  // Authorize S3 buckets
  authorizeS3Buckets(s3Event);

  const record = s3Event.Records[0];
  await saveFileRecord(record);
}

/**
 * Authorizes S3 buckets
 * @param s3Event - The validated S3 event containing a single record
 * @throws InvalidOperationError if multiple records are present
 * @throws UnauthorizedAWSResourceError if any bucket is not authorized
 */
function authorizeS3Buckets(s3Event: S3Event): void {
  // S3 ObjectCreated events should contain exactly one record per SNS message
  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError(
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`
    );
  }

  // Validate the S3 bucket is authorized
  const record = s3Event.Records[0];
  validateS3BucketAuthorization(record.s3.bucket.name);
}

export default handler(method(METHOD.POST), async (req, res) => {
  // Extract and validate request
  const { s3Event, snsMessage } = await validateRequest(req);

  // Process S3 record
  await processS3Record(s3Event, snsMessage);

  // Return success response
  res.status(200).end();
});
