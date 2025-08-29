import { PoolClient } from "pg";
import {
  S3Event,
  S3EventRecord,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/entities";
import { s3EventSchema } from "../apis/catalog/hca-atlas-tracker/aws/schemas";
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
  getExistingMetadataObjectId,
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
    throw new InvalidOperationError(
      `Invalid S3 key format: ${s3Key}. Expected format: bio_network/atlas-name/folder-type/filename`
    );
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
      throw new InvalidOperationError(
        `Unknown folder type: ${folderType}. Expected: source-datasets, integrated-objects, or manifests`
      );
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
 * convertS3VersionToDbVersion('1') // Returns: '1'
 * convertS3VersionToDbVersion('1-1') // Returns: '1.1'
 * convertS3VersionToDbVersion('2-3') // Returns: '2.3'
 */
function convertS3VersionToDbVersion(s3Version: string): string {
  if (s3Version.includes("-")) {
    // Convert '1-1' to '1.1'
    return s3Version.replace("-", ".");
  } else {
    // Keep as-is: '1' stays '1'
    return s3Version;
  }
}

// File operation handler functions
type FileOperationHandler = (
  atlasId: string | null,
  s3Object: { eTag: string; key: string },
  metadataObjectId: string | null,
  transaction: PoolClient
) => Promise<string | null>;

async function createIntegratedObject(
  atlasId: string | null,
  s3Object: { eTag: string; key: string },
  _: string | null,
  transaction: PoolClient
): Promise<string> {
  const fileName = s3Object.key.split("/").pop() || "Unknown";
  const title = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension

  const componentAtlas = await createComponentAtlas(
    atlasId!,
    title,
    {}, // Empty component_info - will be populated with actual integrated object metadata later
    transaction
  );

  return componentAtlas.id;
}

async function createSourceDataset(
  atlasId: string | null,
  object: { eTag: string; key: string },
  metadataObjectId: string | null,
  transaction: PoolClient
): Promise<string> {
  // Extract filename from S3 key for source dataset info
  const filename = object.key.split("/").pop() || "unknown";

  // Create minimal source dataset info for S3 uploads
  const sdInfo = {
    etag: object.eTag,
    filename,
    s3Key: object.key,
    uploadedAt: new Date().toISOString(),
  };

  // Insert new source dataset record without source_study_id (will be linked later)
  const result = await transaction.query(
    `INSERT INTO hat.source_datasets (sd_info, source_study_id)
     VALUES ($1, $2)
     RETURNING id`,
    [JSON.stringify(sdInfo), null]
  );

  const sourceDatasetId = result.rows[0].id;

  // Link source dataset to atlas's source_datasets array
  // Check if already linked to avoid duplicates
  const alreadyLinkedResult = await transaction.query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE a.id = $1 AND $2 = ANY(a.source_datasets))",
    [atlasId, sourceDatasetId]
  );

  if (!alreadyLinkedResult.rows[0].exists) {
    await transaction.query(
      "UPDATE hat.atlases SET source_datasets = source_datasets || $2::uuid WHERE id = $1",
      [atlasId, sourceDatasetId]
    );
  }

  return sourceDatasetId;
}

async function updateIntegratedObject(
  _: string | null,
  __: { eTag: string; key: string },
  metadataObjectId: string | null,
  transaction: PoolClient
): Promise<string | null> {
  if (metadataObjectId) {
    await updateComponentAtlas(
      metadataObjectId,
      {}, // Empty component_info
      transaction
    );
  }
  return metadataObjectId;
}

async function updateSourceDataset(
  _: string | null,
  __: { eTag: string; key: string },
  metadataObjectId: string | null
): Promise<string | null> {
  return metadataObjectId;
}

// Dispatch map
type Operation = "create" | "update";
const FILE_OPERATION_HANDLERS: Partial<
  Record<FILE_TYPE, Record<Operation, FileOperationHandler>>
> = {
  [FILE_TYPE.INTEGRATED_OBJECT]: {
    create: createIntegratedObject,
    update: updateIntegratedObject,
  },
  [FILE_TYPE.SOURCE_DATASET]: {
    create: createSourceDataset,
    update: updateSourceDataset,
  },
  [FILE_TYPE.INGEST_MANIFEST]: {
    create: createSourceDataset,
    update: updateSourceDataset,
  },
  // INGEST_MANIFEST files don't need special handling - they just get file records
};

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
 */
async function handleETagMismatch(
  bucket: { name: string },
  object: { eTag: string; key: string; versionId?: string | null }
): Promise<never> {
  const errorMsg = `ETag mismatch for ${bucket.name}/${object.key} (version: ${
    object.versionId || "null"
  }): new=${object.eTag}`;
  console.error(errorMsg);
  throw new InvalidOperationError(errorMsg);
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
    // STEP 1: Get existing metadata object ID based on file type
    // This is needed before creating new metadata objects or updating existing ones
    let metadataObjectId: string | null = null;

    metadataObjectId = await getExistingMetadataObjectId(
      bucket.name,
      object.key,
      fileType,
      transaction
    );

    // STEP 2: Mark previous versions as not latest and determine if this is a new file
    // Returns 0 for new files, >0 for existing files with previous versions
    const isNewFile = !(await markPreviousVersionsAsNotLatest(
      bucket.name,
      object.key,
      transaction
    ));

    // STEP 3: Determine atlas ID from S3 path
    const { atlasName, network } = parseS3KeyPath(object.key);
    const { atlasBaseName, s3Version } = parseS3AtlasName(atlasName);
    const dbVersion = convertS3VersionToDbVersion(s3Version);
    const atlasId: string = await getAtlasByNetworkVersionAndShortName(
      network,
      dbVersion,
      atlasBaseName
    );

    // STEP 4 & 5: Dispatch file operations based on state and type
    const operation: Operation = isNewFile ? "create" : "update";
    const fileHandlers = FILE_OPERATION_HANDLERS[fileType];

    if (fileHandlers) {
      const handler = fileHandlers[operation];
      const result = await handler(
        atlasId,
        object,
        metadataObjectId,
        transaction
      );
      metadataObjectId = result;
    }

    // STEP 6: Insert new file version with ON CONFLICT handling
    const result = await upsertFileRecord(
      {
        bucket: bucket.name,
        componentAtlasId:
          fileType === FILE_TYPE.INTEGRATED_OBJECT ? metadataObjectId : null,
        etag: object.eTag,
        eventInfo: JSON.stringify(eventInfo),
        fileType,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: object.key,
        sha256Client: sha256,
        sizeBytes: object.size,
        snsMessageId,
        sourceDatasetId:
          fileType === FILE_TYPE.SOURCE_DATASET ? metadataObjectId : null,
        status: FILE_STATUS.UPLOADED,
        versionId: object.versionId || null,
      },
      transaction
    );

    // STEP 7: Handle the three possible outcomes

    // CASE 1: No result returned = ETag mismatch detected
    if (!result) {
      await handleETagMismatch(bucket, object);
      return; // handleETagMismatch throws, but TypeScript needs this
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
