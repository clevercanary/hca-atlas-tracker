import { confirmQueryRowsContainIds } from "app/utils/database";
import pg from "pg";
import { ETagMismatchError } from "../apis/catalog/hca-atlas-tracker/aws/errors";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidationSummary,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerSourceDataset,
  INTEGRITY_STATUS,
  NetworkKey,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasComponentAtlasVersionIds } from "../services/component-atlases";
import { query } from "../services/database";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { getVersionVariants } from "../utils/atlases";
import { getAtlasSourceDatasetVersionIds } from "./source-datasets";

export type FileUpsertResult = Pick<HCAAtlasTrackerDBFile, "etag" | "id"> & {
  operation: "inserted" | "updated";
};

export type FileArchiveStatusInfo = Pick<
  HCAAtlasTrackerDBFile,
  "id" | "is_archived"
>;

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
 * @param transaction - Database transaction client
 * @returns Metadata object ID if found, null otherwise
 */
export async function getExistingMetadataObjectId(
  bucket: string,
  key: string,
  transaction: pg.PoolClient
): Promise<string | null> {
  const fileResult = await transaction.query<
    Pick<HCAAtlasTrackerDBFile, "file_type" | "id">
  >(
    `SELECT file_type, id FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true`,
    [bucket, key]
  );

  if (fileResult.rows.length === 0) return null;

  const { file_type: fileType, id: fileId } = fileResult.rows[0];

  if (fileType === FILE_TYPE.INTEGRATED_OBJECT) {
    const result = await transaction.query<
      Pick<HCAAtlasTrackerComponentAtlas, "id">
    >("SELECT id FROM hat.component_atlases WHERE file_id = $1", [fileId]);
    if (result.rows.length === 0)
      throw new Error(`No component atlas found for file with ID ${fileId}`);
    return result.rows[0].id;
  } else if (fileType === FILE_TYPE.SOURCE_DATASET) {
    const result = await transaction.query<
      Pick<HCAAtlasTrackerSourceDataset, "id">
    >("SELECT id FROM hat.source_datasets WHERE file_id = $1", [fileId]);
    if (result.rows.length === 0)
      throw new Error(`No source dataset found for file with ID ${fileId}`);
    return result.rows[0].id;
  }

  return null;
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
 * Get the latest event_info and sns_notification_id for a file by bucket/key.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @param transaction - Database transaction client
 * @returns Latest event_info and sns_message_id JSON if present, otherwise null
 */
export async function getLatestNotificationInfo(
  bucket: string,
  key: string,
  transaction: pg.PoolClient
): Promise<Pick<
  HCAAtlasTrackerDBFile,
  "event_info" | "sns_message_id"
> | null> {
  const result = await transaction.query<
    Pick<HCAAtlasTrackerDBFile, "event_info" | "sns_message_id">
  >(
    `SELECT event_info, sns_message_id FROM hat.files WHERE bucket = $1 AND key = $2 AND is_latest = true LIMIT 1`,
    [bucket, key]
  );
  return result.rows[0] ?? null;
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
 * Check that the specified file exists, is the latest version, and has the specified atlas ID, throwing an error otherwise.
 * @param fileId - ID of the file to check.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmFileExistsOnAtlas(
  fileId: string,
  atlasId: string
): Promise<void> {
  await confirmFilesExistOnAtlas([fileId], atlasId);
}

/**
 * Check that the specified files exist, are the latest version, and are associated via linked entities with the specified atlas, and throw an error if any aren't.
 * @param fileIds - IDs of the files to check.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmFilesExistOnAtlas(
  fileIds: string[],
  atlasId: string
): Promise<void> {
  const { rows: filesInfo } = await query<
    Pick<HCAAtlasTrackerDBFile, "file_type" | "id" | "is_latest">
  >("SELECT file_type, id, is_latest FROM hat.files WHERE id=ANY($1)", [
    fileIds,
  ]);

  confirmQueryRowsContainIds(filesInfo, fileIds, "files");

  const nonLatestFileIds = filesInfo
    .filter((f) => !f.is_latest)
    .map((f) => f.id);
  if (nonLatestFileIds.length)
    throw new InvalidOperationError(
      `Specified file ID(s) are not latest version: ${nonLatestFileIds.join(
        ", "
      )}`
    );

  // Get file IDs that are not associated with the atlas for each file type
  const missingFileIds = [
    ...(await getTypeFilesMissingFromAtlas(
      FILE_TYPE.INGEST_MANIFEST,
      filesInfo,
      atlasId
    )),
    ...(await getTypeFilesMissingFromAtlas(
      FILE_TYPE.INTEGRATED_OBJECT,
      filesInfo,
      atlasId
    )),
    ...(await getTypeFilesMissingFromAtlas(
      FILE_TYPE.SOURCE_DATASET,
      filesInfo,
      atlasId
    )),
  ];

  if (missingFileIds.length)
    throw new NotFoundError(
      `No files exist on atlas with ID ${atlasId} with ID(s): ${missingFileIds.join(
        ", "
      )}`
    );
}

/**
 * Throw an error if the given file is not of the given type.
 * @param fileId - ID of the file to check.
 * @param expectedType - Expected type for the file.
 * @param client - Postgres client to use.
 */
export async function confirmFileIsOfType(
  fileId: string,
  expectedType: FILE_TYPE,
  client: pg.PoolClient
): Promise<void> {
  const result = await client.query<Pick<HCAAtlasTrackerDBFile, "file_type">>(
    "SELECT file_type FROM hat.files WHERE id = $1",
    [fileId]
  );
  if (result.rows.length === 0)
    throw new NotFoundError(`File with ID ${fileId} doesn't exist`);
  const file = result.rows[0];
  if (file.file_type !== expectedType)
    throw new InvalidOperationError(
      `File ${fileId} is not of type ${expectedType}`
    );
}

/**
 * Get IDs of files from a given list that have associated entities of a particular type which are not associated with the given atlas.
 * @param fileType - Type of file limit check to.
 * @param filesInfo - Array of files, represented by ID and file type.
 * @param atlasId - ID of the atlas to check for the entities on.
 * @returns file IDs.
 */
async function getTypeFilesMissingFromAtlas(
  fileType: FILE_TYPE,
  filesInfo: Pick<HCAAtlasTrackerDBFile, "file_type" | "id">[],
  atlasId: string
): Promise<string[]> {
  const fileIds = filesInfo
    .filter((f) => f.file_type === fileType)
    .map((f) => f.id);

  if (fileIds.length === 0) return [];

  // Ingest manifests are not associated with atlases at a database level
  if (fileType === FILE_TYPE.INGEST_MANIFEST) return fileIds;

  let metadataEntities: Array<{ file_id: string; version_id: string }>;
  let getAtlasEntityIds: (atlasId: string) => Promise<string[]>;

  switch (fileType) {
    case FILE_TYPE.INTEGRATED_OBJECT: {
      metadataEntities = (
        await query<
          Pick<HCAAtlasTrackerDBComponentAtlas, "file_id" | "version_id">
        >(
          "SELECT file_id, version_id FROM hat.component_atlases WHERE file_id = ANY($1)",
          [fileIds]
        )
      ).rows;
      getAtlasEntityIds = getAtlasComponentAtlasVersionIds;
      break;
    }
    case FILE_TYPE.SOURCE_DATASET: {
      metadataEntities = (
        await query<
          Pick<HCAAtlasTrackerDBSourceDataset, "file_id" | "version_id">
        >(
          "SELECT file_id, version_id FROM hat.source_datasets WHERE file_id = ANY($1)",
          [fileIds]
        )
      ).rows;
      getAtlasEntityIds = getAtlasSourceDatasetVersionIds;
      break;
    }
  }

  const idsWithMetadataEntities = new Set(
    metadataEntities.map((m) => m.file_id)
  );
  const idsWithoutMetadataEntities = fileIds.filter(
    (id) => !idsWithMetadataEntities.has(id)
  );
  if (idsWithoutMetadataEntities.length)
    throw new Error(
      `No metadata entities found for files of type ${fileType} with ID(s): ${idsWithoutMetadataEntities.join(
        ", "
      )}`
    );

  const atlasEntityIds = new Set(await getAtlasEntityIds(atlasId));
  const missingFileIds: string[] = [];
  for (const entity of metadataEntities) {
    if (!atlasEntityIds.has(entity.version_id))
      missingFileIds.push(entity.file_id);
  }

  return missingFileIds;
}

export interface FileUpsertData {
  bucket: string;
  etag: string;
  eventInfo: string;
  fileType: string;
  integrityStatus: string;
  key: string;
  sha256Client: string | null;
  sizeBytes: number;
  snsMessageId: string;
  validationStatus: FILE_VALIDATION_STATUS;
  versionId: string | null;
}

/**
 * Insert or update a file record with conflict handling for duplicate S3 notifications.
 * @param fileData - File data to insert/update
 * @param fileData.bucket - S3 bucket name
 * @param fileData.etag - S3 object ETag
 * @param fileData.eventInfo - S3 event information as JSON string
 * @param fileData.fileType - Type of file (source_dataset, integrated_object, etc.)
 * @param fileData.integrityStatus - File integrity status
 * @param fileData.key - S3 object key
 * @param fileData.sha256Client - SHA256 hash from client
 * @param fileData.sizeBytes - File size in bytes
 * @param fileData.snsMessageId - SNS MessageId for deduplication
 * @param fileData.validationStatus - File validation status
 * @param fileData.versionId - S3 object version ID
 * @param transaction - Database transaction to use
 * @throws {ETagMismatchError} When an existing record has a different ETag for the same bucket/key/version
 * @returns Operation result with etag and operation type
 */
export async function upsertFileRecord(
  fileData: FileUpsertData,
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

  const result = await transaction.query<FileUpsertResult>(
    `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, validation_status, is_latest, file_type, sns_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       
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
      true,
      fileData.fileType,
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
 * For every latest-version file, get the information necessary to validate that file.
 * @returns array of files with minimal fields for starting validation.
 */
export async function getAllFilesValidationParams(): Promise<
  Pick<HCAAtlasTrackerDBFile, "file_type" | "id" | "key">[]
> {
  return (
    await query<Pick<HCAAtlasTrackerDBFile, "file_type" | "id" | "key">>(
      "SELECT file_type, id, key FROM hat.files WHERE is_latest AND NOT is_archived"
    )
  ).rows;
}

/**
 * Set the `is_archived` field of each given file to a specified value.
 * @param fileIds - IDs of the files to update.
 * @param isArchived - Value to set for `is_archived`.
 * @returns object with `updated` property indicating whether the value that was set is different from the old value.
 */
export async function setFilesArchiveStatus(
  fileIds: string[],
  isArchived: boolean
): Promise<void> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBFile, "id">>(
    "UPDATE hat.files SET is_archived = $1 WHERE id=ANY($2) RETURNING id",
    [isArchived, fileIds]
  );

  confirmQueryRowsContainIds(queryResult.rows, fileIds, "files");
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
 * Get an object containing ID and archive status for each of the given files.
 * @param fileIds - IDs of files to get archive status for.
 * @returns archive status per file.
 */
export async function getFilesArchiveStatus(
  fileIds: string[]
): Promise<FileArchiveStatusInfo[]> {
  const queryResult = await query<FileArchiveStatusInfo>(
    "SELECT id, is_archived FROM hat.files WHERE id=ANY($1)",
    [fileIds]
  );
  confirmQueryRowsContainIds(queryResult.rows, fileIds, "files");
  return queryResult.rows;
}

export async function getFileKey(fileId: string): Promise<string> {
  const result = await query<Pick<HCAAtlasTrackerDBFile, "key">>(
    "SELECT key FROM hat.files WHERE id=$1",
    [fileId]
  );
  if (result.rows.length === 0) throw getFileNotFoundError(fileId);
  return result.rows[0].key;
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
  if (result.rows.length === 0) throw getFileNotFoundError(fileId);
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
 * @param params.validationReports - Validation reports for individual tools.
 * @param params.validationStatus - Status of validation.
 * @param params.validationSummary - Summary of validation reports.
 */
export async function addValidationResultsToFile(params: {
  client: pg.PoolClient;
  datasetInfo: HCAAtlasTrackerDBFileDatasetInfo | null;
  fileId: string;
  integrityStatus: INTEGRITY_STATUS;
  validatedAt: Date;
  validationInfo: HCAAtlasTrackerDBFileValidationInfo;
  validationReports: FileValidationReports | null;
  validationStatus: FILE_VALIDATION_STATUS;
  validationSummary: FileValidationSummary | null;
}): Promise<void> {
  const {
    client,
    datasetInfo,
    fileId,
    integrityStatus,
    validatedAt,
    validationInfo,
    validationReports,
    validationStatus,
    validationSummary,
  } = params;
  await client.query(
    `
      UPDATE hat.files
      SET
        integrity_status = $1,
        dataset_info = $2,
        validation_info = $3,
        integrity_checked_at = $4,
        validation_status = $5,
        validation_reports = $6,
        validation_summary = $7
      WHERE id = $8
    `,
    [
      integrityStatus,
      JSON.stringify(datasetInfo),
      JSON.stringify(validationInfo),
      validatedAt,
      validationStatus,
      JSON.stringify(validationReports),
      JSON.stringify(validationSummary),
      fileId,
    ]
  );
}

function getFileNotFoundError(
  fileId: string,
  atlasId: string | null = null
): NotFoundError {
  return new NotFoundError(
    `File with ID ${fileId} doesn't exist${
      atlasId === null ? "" : ` on atlas with ID ${atlasId}`
    }`
  );
}
