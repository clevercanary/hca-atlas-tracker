import { PoolClient } from "pg";
import {
  S3Event,
  S3EventRecord,
  s3EventSchema,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import { VALID_FILE_TYPES_FOR_VALIDATION } from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileEventInfo,
  HCAAtlasTrackerDBFile,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../config/aws-resources";
import {
  updateComponentAtlasVersionInAtlases,
  updateSourceDatasetVersionInAtlases,
} from "../data/atlases";
import {
  createNewComponentAtlasVersion,
  markComponentAtlasAsNotLatest,
  updateSourceDatasetVersionInComponentAtlases,
} from "../data/component-atlases";
import {
  FileUpsertResult,
  getLatestNotificationInfo,
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../data/files";
import {
  createNewSourceDatasetVersion,
  markSourceDatasetAsNotLatest,
} from "../data/source-datasets";
import { InvalidOperationError } from "../utils/api-handler";
import { createComponentAtlas } from "./component-atlases";
import { doTransaction } from "./database";
import { startFileValidation } from "./files";
import { createSourceDataset } from "./source-datasets";
import {
  getAtlasMatchingConcept,
  getOrCreateConceptId,
} from "../services/concepts";
import { parseNormalizedInfoFromS3Key, parseS3KeyPath } from "../utils/files";

/**
 * Processes an SNS notification message containing S3 events
 * @param snsMessage - The SNS message containing S3 event data
 * @throws InvalidOperationError if the SNS message doesn't contain valid S3 event data
 * @throws InvalidOperationError if multiple S3 records are present
 * @throws UnauthorizedAWSResourceError if SNS topic or S3 bucket is not authorized
 */
export async function processS3NotificationMessage(
  snsMessage: SNSMessage,
): Promise<void> {
  // Parse S3 event from SNS message
  let s3Event: unknown;
  try {
    s3Event = JSON.parse(snsMessage.Message);
  } catch {
    throw new InvalidOperationError(
      `Failed to parse S3 event from SNS message; invalid JSON: ${snsMessage.Message}`,
    );
  }

  // Delegate to existing S3 processing logic
  await processS3Record(s3Event, snsMessage);
}

/**
 * Check whether a notification is newer than or identical to the existing file record.
 * @param snsMessageId - Incoming SNS message ID.
 * @param eventInfo - Incoming S3 event.
 * @param latestNotificationInfo - Event info and message ID for the latest existing version of the file, if present.
 * @returns object with properties indicating whether the notification represents a new distinct file and whether it represents the latest version of the file.
 */
function compareLatestNotificationInfo(
  snsMessageId: string,
  eventInfo: FileEventInfo,
  latestNotificationInfo: Pick<
    HCAAtlasTrackerDBFile,
    "event_info" | "sns_message_id"
  > | null,
): { isLatestVersion: boolean; isNewVersion: boolean } {
  if (latestNotificationInfo !== null) {
    const { event_info: latestEventInfo, sns_message_id: latestSnsMessageId } =
      latestNotificationInfo;

    const isNewVersion = isNewerEventForFile(latestEventInfo, eventInfo);

    return {
      // Same event time isn't counted as latest, unless the notification is a duplicate, in which case it should pass through to idempotency handling at insertion time
      isLatestVersion: isNewVersion || snsMessageId === latestSnsMessageId,
      isNewVersion,
    };
  }
  return { isLatestVersion: true, isNewVersion: true };
}

// Helper: Determine whether incoming record is newer than the current latest based on event times
function isNewerEventForFile(
  currentLatestInfo: FileEventInfo,
  incomingEventInfo: FileEventInfo,
): boolean {
  // ISO 8601 timestamps compare lexicographically for ordering
  return incomingEventInfo.eventTime > currentLatestInfo.eventTime;
}

// File creation handler functions
type FileCreationHandler = (
  atlasId: string,
  fileId: string,
  conceptId: string,
  transaction: PoolClient,
) => Promise<void>;

async function createIntegratedObject(
  atlasId: string,
  fileId: string,
  conceptId: string,
  transaction: PoolClient,
): Promise<void> {
  await createComponentAtlas(atlasId, fileId, conceptId, transaction);
}

async function createSourceDatasetFromS3(
  atlasId: string,
  fileId: string,
  conceptId: string,
  transaction: PoolClient,
): Promise<void> {
  // Create source dataset using canonical service within the existing transaction
  const sourceDatasetVersion = await createSourceDataset(
    fileId,
    conceptId,
    transaction,
  );

  // Link source dataset to atlas's source_datasets array if not already linked
  const alreadyLinkedResult = await transaction.query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE a.id = $1 AND $2 = ANY(a.source_datasets))",
    [atlasId, sourceDatasetVersion],
  );

  if (alreadyLinkedResult.rows[0].exists) {
    throw new InvalidOperationError(
      `Source dataset version ${sourceDatasetVersion} is unexpectedly already linked to atlas ${atlasId} during create flow`,
    );
  }

  await transaction.query(
    "UPDATE hat.atlases SET source_datasets = source_datasets || $2::uuid WHERE id = $1",
    [atlasId, sourceDatasetVersion],
  );
}

// File update handler functions
type FileUpdateHandler = (
  fileId: string,
  metadataEntityId: string,
  transaction: PoolClient,
) => Promise<void>;

async function updateIntegratedObjectFromS3(
  fileId: string,
  conceptId: string,
  transaction: PoolClient,
): Promise<void> {
  const prevLatestVersion = await markComponentAtlasAsNotLatest(
    conceptId,
    transaction,
  );
  const newVersion = await createNewComponentAtlasVersion(
    prevLatestVersion,
    fileId,
    transaction,
  );
  await updateComponentAtlasVersionInAtlases(
    prevLatestVersion,
    newVersion,
    transaction,
  );
}

async function updateSourceDatasetFromS3(
  fileId: string,
  conceptId: string,
  transaction: PoolClient,
): Promise<void> {
  const prevLatestVersion = await markSourceDatasetAsNotLatest(
    conceptId,
    transaction,
  );
  const newVersion = await createNewSourceDatasetVersion(
    prevLatestVersion,
    fileId,
    transaction,
  );
  await updateSourceDatasetVersionInAtlases(
    prevLatestVersion,
    newVersion,
    transaction,
  );
  await updateSourceDatasetVersionInComponentAtlases(
    prevLatestVersion,
    newVersion,
    transaction,
  );
}

// Dispatch maps
const FILE_CREATION_HANDLERS: Partial<Record<FILE_TYPE, FileCreationHandler>> =
  {
    [FILE_TYPE.INTEGRATED_OBJECT]: createIntegratedObject,
    [FILE_TYPE.SOURCE_DATASET]: createSourceDatasetFromS3,
    // INGEST_MANIFEST files don't need special handling - they just get file records
  };
const FILE_UPDATE_HANDLERS: Partial<Record<FILE_TYPE, FileUpdateHandler>> = {
  [FILE_TYPE.INTEGRATED_OBJECT]: updateIntegratedObjectFromS3,
  [FILE_TYPE.SOURCE_DATASET]: updateSourceDatasetFromS3,
  // Nothing needed for ingest manifests
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
  isNewFile: boolean,
): void {
  if (operation === "inserted") {
    // New file version successfully created
    const fileStatus = isNewFile ? "New file" : "New version of existing file";
    console.log(
      `${fileStatus} record created for ${bucket.name}/${object.key}`,
    );
  } else if (operation === "updated") {
    // Duplicate notification handled idempotently
    console.log(
      `Duplicate notification for ${bucket.name}/${object.key} - ignoring`,
    );
  }
}

/**
 * Handle updates associated with the insertion of a new file record.
 * @param result - File insertion result.
 * @param isNewFile - Whether the inserted record represents a new file.
 * @param fileType - File type.
 * @param conceptId - Existing latest metadata object ID for the file.
 * @param atlasId - ID of the file's atlas.
 * @param transaction - Postgres client to use.
 */
async function handleInsertedFile(
  result: FileUpsertResult,
  isNewFile: boolean,
  fileType: FILE_TYPE,
  conceptId: string,
  atlasId: string,
  transaction: PoolClient,
): Promise<void> {
  // Dispatch file operations based on state and type
  if (isNewFile) {
    const handler = FILE_CREATION_HANDLERS[fileType];

    if (handler) {
      await handler(atlasId, result.id, conceptId, transaction);
    }
  } else {
    const handler = FILE_UPDATE_HANDLERS[fileType];

    if (handler) {
      await handler(result.id, conceptId, transaction);
    }
  }
}

/**
 * Saves or updates a file record in the database with idempotency handling
 * @param record - The S3 event record containing bucket, object, and event metadata
 * @param snsMessageId - SNS MessageId for proper message-level idempotency
 * @returns info to be used for further processing (namely starting validation), or null if no file record could be linked with the notification
 * @throws ETagMismatchError if ETags don't match (indicates potential corruption)
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws UnknownFolderTypeError if folder type is not recognized
 * @throws Error if atlas lookup fails for integrated objects/manifests
 * @note Uses PostgreSQL ON CONFLICT for atomic idempotency handling
 * @note Implements database transaction to ensure is_latest flag consistency
 */
async function saveFileRecord(
  record: S3EventRecord,
  snsMessageId: string,
): Promise<{
  fileId: string;
  s3Key: string;
  shouldValidate: boolean;
} | null> {
  const { bucket, object } = record.s3;

  const eventInfo: FileEventInfo = {
    eventName: record.eventName,
    eventTime: record.eventTime,
  };

  // S3 notifications don't include SHA256 metadata - will be populated later via separate integrity validation
  const sha256 = null;

  // Get atlas and file info from S3 key
  const {
    atlasNetwork: network,
    atlasShortName,
    atlasVersion: { generation: atlasGeneration, revision: atlasRevision },
    fileBaseName,
    fileType,
  } = parseNormalizedInfoFromS3Key(object.key);

  // Ingest manifests are no longer saved in the database - ignore the notification if one is received
  if (fileType === FILE_TYPE.INGEST_MANIFEST) {
    return null;
  }

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
    // Get or create concept ID for the file
    const conceptId = await getOrCreateConceptId(
      {
        atlas_short_name: atlasShortName,
        base_filename: fileBaseName,
        file_type: fileType,
        generation: atlasGeneration,
        network,
      },
      transaction,
    );

    // Determine atlas from concept
    const atlas = await getAtlasMatchingConcept(conceptId, transaction);

    // Confirm that the atlas matches the revision specified in the S3 key
    if (atlas.revision !== atlasRevision) {
      throw new Error(
        `Received file for ${atlas.overview.shortName} v${atlasGeneration}.${atlasRevision}, but atlas is at version ${atlas.generation}.${atlas.revision}`,
      );
    }

    // Determine recency and whether incoming record should be latest
    const latestNotificationInfo = await getLatestNotificationInfo(
      conceptId,
      transaction,
    );

    const isNewFile = latestNotificationInfo === null;

    const { isLatestVersion, isNewVersion } = compareLatestNotificationInfo(
      snsMessageId,
      eventInfo,
      latestNotificationInfo,
    );

    // If this is not the latest version, the notification has arrived out-of-order and is discarded
    if (!isLatestVersion) {
      console.error(
        `Received S3 notification ${snsMessageId} for file ${object.key} out-of-order (event time ${eventInfo.eventTime})`,
      );
      return null;
    }

    // If this is the latest version but not a new version, the existing version is the same as this version and shouldn't be marked non-latest
    // In that case, the notification is a duplicate and is handled idempotently at file insertion time
    if (isNewVersion)
      await markPreviousVersionsAsNotLatest(conceptId, transaction);

    // Insert new file version with ON CONFLICT handling
    const result = await upsertFileRecord(
      {
        bucket: bucket.name,
        conceptId,
        etag: object.eTag,
        eventInfo: JSON.stringify(eventInfo),
        fileType,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: object.key,
        sha256Client: sha256,
        sizeBytes: object.size,
        snsMessageId,
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: object.versionId || null,
      },
      transaction,
    );

    if (result.operation === "inserted") {
      await handleInsertedFile(
        result,
        isNewFile,
        fileType,
        conceptId,
        atlas.id,
        transaction,
      );
    }

    // Success - log the operation type for monitoring
    logFileOperation(result.operation, bucket, object, isNewFile);

    // Return info for additional processing
    return {
      fileId: result.id,
      s3Key: object.key,
      // Validation should be done if a new latest record of the appropriate type was created
      shouldValidate:
        result.operation === "inserted" &&
        VALID_FILE_TYPES_FOR_VALIDATION.includes(fileType),
    };
  });
}

export async function saveAndProcessFileRecord(
  record: S3EventRecord,
  snsMessageId: string,
): Promise<void> {
  const result = await saveFileRecord(record, snsMessageId);

  // Start validation job if appropriate
  if (result?.shouldValidate) {
    await startFileValidation(result.fileId, result.s3Key);
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
  snsMessage: SNSMessage,
): Promise<void> {
  // Authorize SNS topic
  validateSNSTopicAuthorization(snsMessage.TopicArn);

  // Validate S3 event structure and metadata
  const s3Event = s3EventSchema.validateSync(s3EventInput);

  // S3 ObjectCreated events should contain exactly one record per SNS message
  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError(
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`,
    );
  }

  // Authorize S3 buckets
  authorizeS3Buckets(s3Event);

  const record = s3Event.Records[0];

  // Check whether the file specified in the record is one that should be saved
  if (!shouldSaveFileRecord(record)) return;

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
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`,
    );
  }

  // Validate the S3 bucket is authorized
  const record = s3Event.Records[0];
  validateS3BucketAuthorization(record.s3.bucket.name);
}

/**
 * Determine, based on an S3 event record, whether its associated file metadata should be saved in the database (namely, to exclude .keep files)
 * @param record - S3 event record to check
 * @returns boolean indicating whether the file should be saved
 */
function shouldSaveFileRecord(record: S3EventRecord): boolean {
  return parseS3KeyPath(record.s3.object.key).filename !== ".keep";
}
