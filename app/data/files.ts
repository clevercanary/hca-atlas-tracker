import pg from "pg";
import { ETagMismatchError } from "../apis/catalog/hca-atlas-tracker/aws/errors";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  INTEGRITY_STATUS,
  NetworkKey,
  type FileEventInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "../services/database";
import { NotFoundError } from "../utils/api-handler";
import { getVersionVariants } from "../utils/atlases";

type MetadataObjectIdField = "component_atlas_id" | "source_dataset_id";

export type FileUpsertResult = Pick<HCAAtlasTrackerDBFile, "etag" | "id"> & {
  operation: "inserted" | "updated";
};

/**
 * Marks all previous versions of a file as no longer latest
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @param transaction - Database transaction client
 * @returns Number of rows updated (0 = new file, >0 = existing file with previous versions)
 */
export async function markPreviousVersionsAsNotLatest(
  bucket: string,
  key: string,
  transaction: pg.PoolClient
): Promise<number> {
  const result = await transaction.query(
    `UPDATE hat.files SET is_latest = FALSE WHERE bucket = $1 AND key = $2`,
    [bucket, key]
  );
  return result.rowCount || 0;
}

/**
 * Get existing metadata object ID for a file based on file type.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @param fileType - Type of file (source_dataset, integrated_object, etc.)
 * @param transaction - Database transaction client
 * @returns Metadata object ID if found, null otherwise
 */
export async function getExistingMetadataObjectId(
  bucket: string,
  key: string,
  fileType: FILE_TYPE,
  transaction: pg.PoolClient
): Promise<string | null> {
  let column: MetadataObjectIdField;

  if (fileType === "integrated_object") {
    column = "component_atlas_id";
  } else if (fileType === "source_dataset") {
    column = "source_dataset_id";
  } else {
    return null; // ingest_manifest files don't have metadata objects
  }

  const result = await transaction.query<
    Pick<HCAAtlasTrackerDBFile, MetadataObjectIdField>
  >(
    `SELECT component_atlas_id, source_dataset_id FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true`,
    [bucket, key]
  );

  return result.rows.length > 0 ? result.rows[0][column] : null;
}

/**
 * Get existing ETag for a specific file version.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @param versionId - S3 version ID
 * @param transaction - Database transaction client
 * @returns Existing ETag if found, null otherwise
 */
export async function getExistingETag(
  bucket: string,
  key: string,
  versionId: string | null,
  transaction: pg.PoolClient
): Promise<string | null> {
  if (versionId === null) return null; // The query will not have any results if versionId is null, so return null early
  const result = await transaction.query<Pick<HCAAtlasTrackerDBFile, "etag">>(
    `SELECT etag FROM hat.files WHERE bucket = $1 AND key = $2 AND version_id = $3`,
    [bucket, key, versionId]
  );
  return result.rows[0]?.etag || null;
}

/**
 * Get the latest event_info for a file by bucket/key.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @param transaction - Database transaction client
 * @returns Latest event_info JSON if present, otherwise null
 */
export async function getLatestEventInfo(
  bucket: string,
  key: string,
  transaction: pg.PoolClient
): Promise<FileEventInfo | null> {
  const result = await transaction.query<
    Pick<HCAAtlasTrackerDBFile, "event_info">
  >(
    `SELECT event_info FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true LIMIT 1`,
    [bucket, key]
  );
  return result.rows[0]?.event_info ?? null;
}

/**
 * Get atlas ID by network, version, and short name with flexible version matching.
 * @param network - Atlas network.
 * @param version - Atlas version (supports flexible matching like "1" vs "1.0").
 * @param shortName - Atlas short name (case-insensitive match).
 * @returns Atlas ID.
 */
export async function getAtlasByNetworkVersionAndShortName(
  network: NetworkKey,
  version: string,
  shortName: string
): Promise<string> {
  const versionVariants = getVersionVariants(version);

  const result = await query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    `SELECT id
       FROM hat.atlases 
       WHERE overview->>'network' = $1 
       AND overview->>'version' = ANY($2)
       AND LOWER(overview->>'shortName') = LOWER($3)`,
    [network, versionVariants, shortName]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError(
      `Atlas not found for network: ${network}, shortName: ${shortName}, version: ${version}`
    );
  }

  if (result.rows.length > 1) {
    throw new Error(
      `Multiple atlases found for network: ${network}, shortName: ${shortName}, version: ${version}. Found ${result.rows.length} matches.`
    );
  }

  return result.rows[0].id;
}

/**
 * Check that the specified file exists and has the specified atlas ID, throwing an error otherwise.
 * @param fileId - ID of the file to check.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmFileExistsOnAtlas(
  fileId: string,
  atlasId: string
): Promise<void> {
  const result = await query(
    `SELECT 1 FROM hat.files f
       WHERE f.id = $1
       AND (
         -- Integrated object files via component atlas
         EXISTS (
           SELECT 1 FROM hat.component_atlases ca 
           WHERE f.component_atlas_id = ca.id AND ca.atlas_id = $2
         )
         OR
         -- Source dataset files (with or without source study)
         f.source_dataset_id IS NOT NULL
       )`,
    [fileId, atlasId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError(
      `File with id ${fileId} doesn't exist on the specified atlas.`
    );
  }
}

/**
 * Insert or update a file record with conflict handling for duplicate S3 notifications.
 * @param fileData - File data to insert/update
 * @param fileData.bucket - S3 bucket name
 * @param fileData.componentAtlasId - Component atlas ID (if applicable)
 * @param fileData.etag - S3 object ETag
 * @param fileData.eventInfo - S3 event information as JSON string
 * @param fileData.fileType - Type of file (source_dataset, integrated_object, etc.)
 * @param fileData.integrityStatus - File integrity status
 * @param fileData.isLatest - Whether this insert should set is_latest for the record
 * @param fileData.key - S3 object key
 * @param fileData.sha256Client - SHA256 hash from client
 * @param fileData.sizeBytes - File size in bytes
 * @param fileData.sourceDatasetId - Source dataset ID (if applicable)
 * @param fileData.snsMessageId - SNS MessageId for deduplication
 * @param fileData.validationStatus - File validation status
 * @param fileData.versionId - S3 object version ID
 * @param transaction - Database transaction to use
 * @throws {ETagMismatchError} When an existing record has a different ETag for the same bucket/key/version
 * @returns Operation result with etag and operation type
 */
export async function upsertFileRecord(
  fileData: {
    bucket: string;
    componentAtlasId: string | null;
    etag: string;
    eventInfo: string;
    fileType: string;
    integrityStatus: string;
    isLatest?: boolean;
    key: string;
    sha256Client: string | null;
    sizeBytes: number;
    snsMessageId: string;
    sourceDatasetId: string | null;
    validationStatus: FILE_VALIDATION_STATUS;
    versionId: string | null;
  },
  transaction: pg.PoolClient
): Promise<FileUpsertResult> {
  // First check if a file with same bucket/key/version already exists
  const existingETag = await getExistingETag(
    fileData.bucket,
    fileData.key,
    fileData.versionId,
    transaction
  );

  if (existingETag !== null && existingETag !== fileData.etag) {
    // ETag mismatch detected - throw to map to HTTP 409 at API layer
    throw new ETagMismatchError(
      fileData.bucket,
      fileData.key,
      fileData.versionId,
      existingETag,
      fileData.etag
    );
  }
  // For same ETag, this is likely a duplicate notification; handle via ON CONFLICT

  const isLatest = fileData.isLatest ?? true;
  const result = await transaction.query<FileUpsertResult>(
    `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, validation_status, is_latest, file_type, source_dataset_id, component_atlas_id, sns_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       
       -- Handle conflicts on sns_message_id (proper SNS idempotency)
       ON CONFLICT (sns_message_id) 
       DO UPDATE SET 
         etag = files.etag,  -- Keep existing ETag (no change)
         event_info = files.event_info,
         updated_at = CURRENT_TIMESTAMP
       WHERE files.etag = EXCLUDED.etag
       
       RETURNING 
         (CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END) as operation,
         etag,
         id`,
    [
      fileData.bucket,
      fileData.key,
      fileData.versionId,
      fileData.etag,
      fileData.sizeBytes,
      fileData.eventInfo,
      fileData.sha256Client,
      fileData.integrityStatus,
      fileData.validationStatus,
      isLatest,
      fileData.fileType,
      fileData.sourceDatasetId,
      fileData.componentAtlasId,
      fileData.snsMessageId,
    ]
  );

  // Check if the operation succeeded
  if (result.rows.length === 0) {
    // This happens when ON CONFLICT DO UPDATE WHERE condition fails
    // Meaning ETags don't match - throw ETagMismatchError
    // Fetch the existing ETag so the caller can construct a detailed error without extra reads
    const existingETag = await getExistingETag(
      fileData.bucket,
      fileData.key,
      fileData.versionId,
      transaction
    );
    if (existingETag) {
      throw new ETagMismatchError(
        fileData.bucket,
        fileData.key,
        fileData.versionId,
        existingETag,
        fileData.etag
      );
    }
    // Fallback: if we could not retrieve the existing ETag, throw a generic mismatch error
    throw new Error("ETag mismatch detected");
  }

  return result.rows[0];
}

/**
 * For every file, get the information necessary to validate that file.
 * @returns array of files with minimal fields for starting validation.
 */
export async function getAllFilesValidationParams(): Promise<
  Pick<HCAAtlasTrackerDBFile, "file_type" | "id" | "key">[]
> {
  return (
    await query<Pick<HCAAtlasTrackerDBFile, "file_type" | "id" | "key">>(
      "SELECT file_type, id, key FROM hat.files"
    )
  ).rows;
}

export async function setFileValidationStatus(
  fileId: string,
  validationStatus: FILE_VALIDATION_STATUS,
  client?: pg.PoolClient
): Promise<void> {
  await query(
    "UPDATE hat.files SET validation_status = $1 WHERE id = $2",
    [validationStatus, fileId],
    client
  );
}

export async function setFileIntegrityStatus(
  fileId: string,
  integrityStatus: INTEGRITY_STATUS,
  client?: pg.PoolClient
): Promise<void> {
  await query(
    "UPDATE hat.files SET integrity_status = $1 WHERE id = $2",
    [integrityStatus, fileId],
    client
  );
}

/**
 * Get the currently-stored date at which the given file was last validated.
 * @param fileId - ID of file to get validation timestamp of.
 * @param client - Postgres client to use.
 * @returns validation date, or null if absent.
 */
export async function getLastValidationTimestamp(
  fileId: string,
  client: pg.PoolClient
): Promise<Date | null> {
  const result = await client.query<
    Pick<HCAAtlasTrackerDBFile, "integrity_checked_at">
  >("SELECT integrity_checked_at FROM hat.files WHERE id=$1", [fileId]);
  if (result.rows.length === 0)
    throw new NotFoundError(`File with id ${fileId} doesn't exist`);
  return result.rows[0].integrity_checked_at;
}

/**
 * Add info from validation results to a file record.
 * @param params - Parameters.
 * @param params.client - Postgres client to use.
 * @param params.datasetInfo - Dataset info to add to the file.
 * @param params.fileId - ID of the file to update.
 * @param params.integrityStatus - Integrity status to set on the file.
 * @param params.validatedAt - Time at which the validation started.
 * @param params.validationInfo - Metadata of the validation.
 * @param params.validationStatus - Status of validation.
 */
export async function addValidationResultsToFile(params: {
  client: pg.PoolClient;
  datasetInfo: HCAAtlasTrackerDBFileDatasetInfo | null;
  fileId: string;
  integrityStatus: INTEGRITY_STATUS;
  validatedAt: Date;
  validationInfo: HCAAtlasTrackerDBFileValidationInfo;
  validationStatus: FILE_VALIDATION_STATUS;
}): Promise<void> {
  const {
    client,
    datasetInfo,
    fileId,
    integrityStatus,
    validatedAt,
    validationInfo,
    validationStatus,
  } = params;
  await client.query(
    `
      UPDATE hat.files
      SET
        integrity_status = $1,
        dataset_info = $2,
        validation_info = $3,
        integrity_checked_at = $4,
        validation_status = $5
      WHERE id = $6
    `,
    [
      integrityStatus,
      JSON.stringify(datasetInfo),
      JSON.stringify(validationInfo),
      validatedAt,
      validationStatus,
      fileId,
    ]
  );
}
