import {
  ETagMismatchError,
  InvalidS3KeyFormatError,
  UnknownFolderTypeError,
} from "../apis/catalog/hca-atlas-tracker/aws/errors";
import {
  S3Event,
  S3EventRecord,
  s3EventSchema,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  FILE_STATUS,
  FILE_TYPE,
  FileEventInfo,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../config/aws-resources";
import { InvalidOperationError } from "../utils/api-handler";
import { doTransaction, query } from "./database";

/**
 * Processes an SNS notification message containing S3 events
 * @param snsMessage - The SNS message containing S3 event data
 * @throws InvalidOperationError if the SNS message doesn't contain valid S3 event data
 * @throws InvalidOperationError if multiple S3 records are present
 * @throws UnauthorizedAWSResourceError if SNS topic or S3 bucket is not authorized
 */
export async function processS3NotificationMessage(
  snsMessage: SNSMessage
): Promise<void> {
  // Parse S3 event from SNS message
  let s3Event: S3Event;
  try {
    s3Event = JSON.parse(snsMessage.Message);
  } catch (parseError) {
    throw new InvalidOperationError(
      "Failed to parse S3 event from SNS message"
    );
  }

  // Delegate to existing S3 processing logic
  await processS3Record(s3Event, snsMessage);
}

// Parsed S3 key path components
interface S3KeyPathComponents {
  atlasName: string; // e.g., 'gut-v1'
  filename: string; // e.g., 'file.h5ad'
  folderType: string; // e.g., 'source-datasets', 'integrated-objects', 'manifests'
  network: string; // e.g., 'bio_network'
}

/**
 * Parses S3 key path into standardized components
 * @param s3Key - The S3 object key to parse
 * @returns Parsed components including network, atlas name, folder type, and filename
 * @throws InvalidS3KeyFormatError if the S3 key doesn't have at least 4 path segments
 * @example
 * parseS3KeyPath('bio_network/gut-v1/integrated-objects/file.h5ad')
 * // Returns: { network: 'bio_network', atlasName: 'gut-v1', folderType: 'integrated-objects', filename: 'file.h5ad' }
 */
export function parseS3KeyPath(s3Key: string): S3KeyPathComponents {
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

/**
 * Determines the file type based on the S3 key folder structure
 * @param s3Key - The S3 object key to analyze
 * @returns The file type: 'source_dataset', 'integrated_object', or 'ingest_manifest'
 * @throws UnknownFolderTypeError if the folder type is not recognized
 */
function determineFileType(s3Key: string): FILE_TYPE {
  const { folderType } = parseS3KeyPath(s3Key);

  switch (folderType) {
    case "source-datasets":
      return FILE_TYPE.SOURCE_DATASET;
    case "integrated-objects":
      return FILE_TYPE.INTEGRATED_OBJECT;
    case "manifests":
      return FILE_TYPE.INGEST_MANIFEST;
    default:
      throw new UnknownFolderTypeError(folderType);
  }
}

/**
 * Parses S3 atlas name into base name and version components
 * @param s3AtlasName - The atlas name from S3 path (e.g., 'gut-v1', 'retina-v1-1')
 * @returns Object containing the atlas base name and S3 version string
 * @throws Error if the atlas name doesn't match the expected format
 * @example
 * parseS3AtlasName('gut-v1') // Returns: { atlasBaseName: 'gut', s3Version: '1' }
 * parseS3AtlasName('retina-v1-1') // Returns: { atlasBaseName: 'retina', s3Version: '1-1' }
 */
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

/**
 * Converts S3 version format to database version format
 * @param s3Version - The version string from S3 (without 'v' prefix)
 * @returns Database-compatible version string
 * @example
 * convertS3VersionToDbVersion('1') // Returns: '1.0'
 * convertS3VersionToDbVersion('1-1') // Returns: '1.1'
 * convertS3VersionToDbVersion('2-3') // Returns: '2.3'
 */
function convertS3VersionToDbVersion(s3Version: string): string {
  if (s3Version.includes("-")) {
    // Convert '1-1' to '1.1'
    return s3Version.replace("-", ".");
  } else {
    // Convert '1' to '1.0'
    return s3Version + ".0";
  }
}

/**
 * Determines the atlas ID for integrated objects and ingest manifests
 * @param s3Key - The S3 object key containing atlas information
 * @param fileType - The file type ('source_dataset', 'integrated_object', or 'ingest_manifest')
 * @returns The atlas ID from the database, or null for source datasets
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws Error if atlas name format is invalid or atlas not found in database
 * @note Source datasets return null as they use source_study_id instead of atlas_id
 */
async function determineAtlasId(
  s3Key: string,
  fileType: FILE_TYPE
): Promise<string | null> {
  // Source datasets don't use atlas_id, they use source_study_id
  if (fileType === FILE_TYPE.SOURCE_DATASET) {
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

/**
 * Saves or updates a file record in the database with idempotency handling
 * @param record - The S3 event record containing bucket, object, and event metadata
 * @throws ETagMismatchError if ETags don't match (indicates potential corruption)
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws UnknownFolderTypeError if folder type is not recognized
 * @throws Error if atlas lookup fails for integrated objects/manifests
 * @note Uses PostgreSQL ON CONFLICT for atomic idempotency handling
 * @note Implements database transaction to ensure is_latest flag consistency
 */
async function saveFileRecord(record: S3EventRecord): Promise<void> {
  const { bucket, object } = record.s3;

  const eventInfo: FileEventInfo = {
    eventName: record.eventName,
    eventTime: record.eventTime,
  };

  // S3 notifications don't include SHA256 metadata - will be populated later via separate integrity validation
  const sha256 = null;

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
        INTEGRITY_STATUS.PENDING,
        FILE_STATUS.UPLOADED,
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
 * Processes the S3 record from the event
 * @param s3Event - The validated S3 event containing a single record
 * @param snsMessage - The validated SNS message containing the S3 event
 * @throws InvalidOperationError if multiple records are present
 */
export async function processS3Record(
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
