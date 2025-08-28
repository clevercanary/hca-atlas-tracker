import { PoolClient } from "pg";
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
import {
  getAtlasByNetworkVersionAndShortName,
  getExistingComponentAtlasId,
  getExistingETag,
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../data/files";
import { InvalidOperationError } from "../utils/api-handler";
import {
  createComponentAtlas,
  updateComponentAtlas,
} from "./component-atlases";
import { doTransaction } from "./database";

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
 * Determines the atlas ID for integrated objects and ingest manifests based on S3 key path
 * @param s3Key - The S3 object key (path)
 * @param fileType - The determined file type
 * @returns Atlas ID for integrated objects/manifests, null for source datasets
 * @throws Error if atlas name format is invalid or atlas not found in database
 * @note Will be used in next phase to create/link metadata objects (source datasets, component atlases)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Will be used in next phase for metadata object creation
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

  return await getAtlasByNetworkVersionAndShortName(
    network,
    dbVersion,
    atlasBaseName
  );
}

/**
 * Handle ETag mismatch error case.
 * This happens when ON CONFLICT triggered but WHERE clause failed,
 * indicating potential data corruption or AWS infrastructure issue.
 *
 * @param bucket - S3 bucket information
 * @param bucket.name - S3 bucket name
 * @param object - S3 object information
 * @param object.eTag - S3 object ETag
 * @param object.key - S3 object key
 * @param object.versionId - S3 object version ID
 * @param transaction - Database transaction client
 */
async function handleETagMismatch(
  bucket: { name: string },
  object: { eTag: string; key: string; versionId?: string | null },
  transaction: PoolClient
): Promise<never> {
  // Get the existing ETag for detailed error reporting
  const existingETag = await getExistingETag(
    bucket.name,
    object.key,
    object.versionId || null,
    transaction
  );

  const errorMsg = `ETag mismatch for ${bucket.name}/${object.key} (version: ${
    object.versionId || "null"
  }): existing=${existingETag}, new=${object.eTag}`;
  console.error(errorMsg);
  throw new ETagMismatchError(
    bucket.name,
    object.key,
    object.versionId || null,
    existingETag || "unknown",
    object.eTag
  );
}

/**
 * Log file operation results for monitoring.
 *
 * @param operation - Database operation result ("inserted" or "updated")
 * @param bucket - S3 bucket information
 * @param bucket.name - S3 bucket name
 * @param object - S3 object information
 * @param object.key - S3 object key
 * @param isNewFile - Whether this is a completely new file or new version
 */
function logFileOperation(
  operation: string,
  bucket: { name: string },
  object: { key: string },
  isNewFile: boolean
): void {
  if (operation === "inserted") {
    // New file version successfully created
    const fileStatus = isNewFile ? "New file" : "New version of existing file";
    console.log(
      `${fileStatus} record created for ${bucket.name}/${object.key}`
    );
  } else if (operation === "updated") {
    // Duplicate notification handled idempotently
    console.log(
      `Duplicate notification for ${bucket.name}/${object.key} - ignoring`
    );
  }
}

/**
 * Saves or updates a file record in the database with idempotency handling
 * @param record - The S3 event record containing bucket, object, and event metadata
 * @param snsMessageId - SNS MessageId for proper message-level idempotency
 * @throws ETagMismatchError if ETags don't match (indicates potential corruption)
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws UnknownFolderTypeError if folder type is not recognized
 * @throws Error if atlas lookup fails for integrated objects/manifests
 * @note Uses PostgreSQL ON CONFLICT for atomic idempotency handling
 * @note Implements database transaction to ensure is_latest flag consistency
 */
async function saveFileRecord(
  record: S3EventRecord,
  snsMessageId: string
): Promise<void> {
  const { bucket, object } = record.s3;

  const eventInfo: FileEventInfo = {
    eventName: record.eventName,
    eventTime: record.eventTime,
  };

  // S3 notifications don't include SHA256 metadata - will be populated later via separate integrity validation
  const sha256 = null;

  // Determine file type from S3 key path structure
  const fileType = determineFileType(object.key);

  // Note: Atlas ID determination removed - will be handled when creating metadata objects

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
    // STEP 1: Check if this is a new file by looking for existing versions
    // Get existing component atlas ID before marking previous versions as not latest
    let componentAtlasId: string | null = null;
    const sourceDatasetId: string | null = null;

    componentAtlasId = await getExistingComponentAtlasId(
      bucket.name,
      object.key,
      transaction
    );
    const isNewFile = componentAtlasId === null;

    // STEP 2: Mark all previous versions of this file as no longer latest
    // This ensures only one version per (bucket, key) has is_latest = true
    await markPreviousVersionsAsNotLatest(bucket.name, object.key, transaction);

    // Determine atlas ID once for reuse
    const atlasId = await determineAtlasId(object.key, fileType);

    if (isNewFile) {
      if (fileType === FILE_TYPE.INTEGRATED_OBJECT && atlasId) {
        // Create component atlas with file name as title
        const fileName = object.key.split("/").pop() || "Unknown";
        const title = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension

        const componentAtlas = await createComponentAtlas(
          atlasId,
          title,
          {}, // Empty component_info - will be populated with actual integrated object metadata later
          transaction
        );

        componentAtlasId = componentAtlas.id;
      } else if (fileType === FILE_TYPE.SOURCE_DATASET) {
        // TODO: Implement source dataset creation for S3 uploads
        // The existing createSourceDataset function requires atlasId, sourceStudyId, and NewSourceDatasetData
        // but we need to determine how to handle source dataset creation from S3 file uploads
        console.log(
          "Source dataset file uploaded, but creation logic not yet implemented"
        );

        // Skip file record creation until source dataset logic is implemented
        // This prevents database constraint violations
        return;
      }
    } else {
      // File update case - reset component atlas metadata if it exists
      if (fileType === FILE_TYPE.INTEGRATED_OBJECT && componentAtlasId) {
        // Reset component_info to empty object - will be populated with actual integrated object metadata later
        await updateComponentAtlas(
          componentAtlasId,
          {}, // Empty component_info
          transaction
        );
      }
    }

    // STEP 2: Insert new version with ON CONFLICT handling
    const result = await upsertFileRecord(
      {
        bucket: bucket.name,
        componentAtlasId,
        etag: object.eTag,
        eventInfo: JSON.stringify(eventInfo),
        fileType,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: object.key,
        sha256Client: sha256,
        sizeBytes: object.size,
        snsMessageId,
        sourceDatasetId,
        status: FILE_STATUS.UPLOADED,
        versionId: object.versionId || null,
      },
      transaction
    );

    // STEP 3: Handle the three possible outcomes

    // CASE 1: No result returned = ETag mismatch detected
    if (!result) {
      await handleETagMismatch(bucket, object, transaction);
    }

    // CASE 2 & 3: Success - log the operation type for monitoring
    logFileOperation(result.operation, bucket, object, isNewFile);
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
  await saveFileRecord(record, snsMessage.MessageId);
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
