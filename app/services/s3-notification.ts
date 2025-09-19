import { PoolClient } from "pg";
import {
  S3Event,
  S3EventRecord,
  s3EventSchema,
  S3Object,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import { VALID_FILE_TYPES_FOR_VALIDATION } from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileEventInfo,
  INTEGRITY_STATUS,
  NetworkKey,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { isNetworkKey } from "../apis/catalog/hca-atlas-tracker/common/utils";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../config/aws-resources";
import {
  getAtlasByNetworkVersionAndShortName,
  getExistingMetadataObjectId,
  getLatestEventInfo,
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../data/files";
import { InvalidOperationError } from "../utils/api-handler";
import { normalizeAtlasVersion } from "../utils/atlases";
import {
  createComponentAtlas,
  resetComponentAtlasInfo,
} from "./component-atlases";
import { doTransaction } from "./database";
import { createSourceDataset, resetSourceDatasetInfo } from "./source-datasets";
import { submitDatasetValidationJob } from "./validator-batch";

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
  let s3Event: unknown;
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
  network: NetworkKey; // e.g., 'bio_network'
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

  const network = pathParts[0];

  if (!isNetworkKey(network)) {
    throw new InvalidOperationError(`Unknown bionetwork: ${network}`);
  }

  return {
    atlasName: pathParts[1],
    filename: pathParts[pathParts.length - 1], // Last segment
    folderType: pathParts[pathParts.length - 2], // Second to last segment
    network,
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

/**
 * Derive a human-friendly title from an S3 key by taking the filename and removing the final extension.
 * @param key - The S3 object key.
 * @returns filename without extension, or "Unknown" if not determinable.
 */
function getTitleFromS3Key(key: string): string {
  const fileName = key.split("/").pop() || "Unknown";
  // Remove only the last extension (handles multi-dot filenames)
  return fileName.replace(/\.[^/.]+$/, "");
}

// Helper: Determine whether incoming record should be latest based on event times
function computeIsLatestForInsert(
  isNewFile: boolean,
  currentLatestInfo: FileEventInfo | null,
  incomingEventInfo: FileEventInfo
): boolean {
  if (isNewFile) return true;
  const currentLatestTime = currentLatestInfo?.eventTime ?? "";
  // ISO 8601 timestamps compare lexicographically for ordering
  return incomingEventInfo.eventTime > currentLatestTime;
}

// File operation handler functions
type FileOperationHandler = (
  atlasId: string,
  s3Object: S3Object,
  metadataObjectId: string | null,
  transaction: PoolClient
) => Promise<string | null>;

async function createIntegratedObject(
  atlasId: string,
  s3Object: S3Object,
  _: string | null,
  transaction: PoolClient
): Promise<string> {
  const title = getTitleFromS3Key(s3Object.key);

  const componentAtlas = await createComponentAtlas(
    atlasId,
    title,
    transaction
  );

  return componentAtlas.id;
}

async function createSourceDatasetFromS3(
  atlasId: string,
  object: S3Object,
  metadataObjectId: string | null,
  transaction: PoolClient
): Promise<string> {
  // Derive title from S3 key filename (without extension)
  const title = getTitleFromS3Key(object.key);

  // Create source dataset using canonical service within the existing transaction
  const createdId = await createSourceDataset(null, { title }, transaction);
  const sourceDatasetId = createdId;

  // Link source dataset to atlas's source_datasets array if not already linked
  const alreadyLinkedResult = await transaction.query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE a.id = $1 AND $2 = ANY(a.source_datasets))",
    [atlasId, sourceDatasetId]
  );

  if (alreadyLinkedResult.rows[0].exists) {
    throw new InvalidOperationError(
      `Source dataset ${sourceDatasetId} is unexpectedly already linked to atlas ${atlasId} during create flow`
    );
  }

  await transaction.query(
    "UPDATE hat.atlases SET source_datasets = source_datasets || $2::uuid WHERE id = $1",
    [atlasId, sourceDatasetId]
  );

  return sourceDatasetId;
}

async function updateIntegratedObject(
  _: string,
  __: S3Object,
  metadataObjectId: string | null,
  transaction: PoolClient
): Promise<string | null> {
  if (metadataObjectId) {
    // Reset component_info to empty values on edit. This will be repopulated with actual integrated object metadata when it is validated.
    await resetComponentAtlasInfo(metadataObjectId, transaction);
  }
  return metadataObjectId;
}

export async function updateSourceDataset(
  _: string,
  object: S3Object,
  metadataObjectId: string | null,
  transaction: PoolClient
): Promise<string | null> {
  // On update, a corresponding source dataset metadata object must exist.
  if (!metadataObjectId) {
    throw new InvalidOperationError(
      `Missing source dataset metadata object for update of file ${object.key}`
    );
  }

  // Derive title from S3 key filename (without extension)
  const title = getTitleFromS3Key(object.key);

  // Reset sd_info on the linked source dataset when a source_dataset file is updated.
  await resetSourceDatasetInfo(metadataObjectId, { title }, transaction);

  return metadataObjectId;
}

// No-op handler: used for file types that should not create or modify metadata objects
async function noopFileHandler(
  _: string,
  __: S3Object,
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
    create: createSourceDatasetFromS3,
    update: updateSourceDataset,
  },
  [FILE_TYPE.INGEST_MANIFEST]: {
    create: noopFileHandler,
    update: noopFileHandler,
  },
  // INGEST_MANIFEST files don't need special handling - they just get file records
};

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
 * @returns info to be used for further processing (namely starting validation)
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
): Promise<{
  fileId: string;
  s3Key: string;
  shouldValidate: boolean;
}> {
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
  return await doTransaction(async (transaction) => {
    // STEP 1: Get existing metadata object ID based on file type
    // This is needed before creating new metadata objects or updating existing ones
    let metadataObjectId: string | null = null;

    metadataObjectId = await getExistingMetadataObjectId(
      bucket.name,
      object.key,
      fileType,
      transaction
    );

    // STEP 2: Determine recency and whether incoming record should be latest
    const latestEventInfo = await getLatestEventInfo(
      bucket.name,
      object.key,
      transaction
    );

    const isNewFile = latestEventInfo === null;

    const isLatestForInsert = computeIsLatestForInsert(
      isNewFile,
      latestEventInfo,
      eventInfo
    );

    // Only clear previous versions if this incoming record is newer
    if (isLatestForInsert) {
      await markPreviousVersionsAsNotLatest(
        bucket.name,
        object.key,
        transaction
      );
    }

    // STEP 3: Determine atlas ID from S3 path
    const { atlasName, network } = parseS3KeyPath(object.key);
    const { atlasBaseName, s3Version } = parseS3AtlasName(atlasName);
    const dbVersionRaw = convertS3VersionToDbVersion(s3Version);
    const dbVersion = normalizeAtlasVersion(dbVersionRaw);
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
        isLatest: isLatestForInsert,
        key: object.key,
        sha256Client: sha256,
        sizeBytes: object.size,
        snsMessageId,
        sourceDatasetId:
          fileType === FILE_TYPE.SOURCE_DATASET ? metadataObjectId : null,
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: object.versionId || null,
      },
      transaction
    );

    // CASE 2 & 3: Success - log the operation type for monitoring
    logFileOperation(result.operation, bucket, object, isNewFile);

    // Return info for additional processing
    return {
      fileId: result.id,
      s3Key: object.key,
      // Validation should be done if a new latest record of the appropriate type was created
      shouldValidate:
        result.operation === "inserted" &&
        isLatestForInsert &&
        VALID_FILE_TYPES_FOR_VALIDATION.includes(fileType),
    };
  });
}

async function startFileValidation(
  fileId: string,
  s3Key: string
): Promise<void> {
  const { jobId } = await submitDatasetValidationJob({
    fileId,
    s3Key,
  });

  console.log(
    `Started Batch job ${jobId} to validate ${s3Key} (file ${fileId})`
  );
}

export async function saveAndProcessFileRecord(
  record: S3EventRecord,
  snsMessageId: string
): Promise<void> {
  const { fileId, s3Key, shouldValidate } = await saveFileRecord(
    record,
    snsMessageId
  );

  // Start validation job if appropriate
  if (shouldValidate) {
    await startFileValidation(fileId, s3Key);
  }
}

/**
 * Processes the S3 record from the event
 * @param s3EventInput - The unvalidated S3 event, which should contain a single record
 * @param snsMessage - The validated SNS message containing the S3 event
 * @throws InvalidOperationError if multiple records are present
 */
export async function processS3Record(
  s3EventInput: unknown,
  snsMessage: SNSMessage
): Promise<void> {
  // Authorize SNS topic
  validateSNSTopicAuthorization(snsMessage.TopicArn);

  // Validate S3 event structure and metadata
  const s3Event = s3EventSchema.validateSync(s3EventInput);

  // S3 ObjectCreated events should contain exactly one record per SNS message
  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError(
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`
    );
  }

  // Authorize S3 buckets
  authorizeS3Buckets(s3Event);

  const record = s3Event.Records[0];
  await saveAndProcessFileRecord(record, snsMessage.MessageId);
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
