import pg from "pg";
import { query } from "../services/database";
import { NotFoundError } from "../utils/api-handler";

/**
 * Generate version variants for flexible matching.
 * @param version - Original version string.
 * @returns Array of version variants to match against.
 */
function getVersionVariants(version: string): string[] {
  const versionWithoutDecimal = version.replace(".0", "");
  const versionWithDecimal = version.includes(".") ? version : `${version}.0`;

  // Return unique variants
  return [...new Set([version, versionWithoutDecimal, versionWithDecimal])];
}

/**
 * Get atlas ID by network, version, and short name with flexible version matching.
 * @param network - Atlas network.
 * @param version - Atlas version (supports flexible matching like "1" vs "1.0").
 * @param shortName - Atlas short name (case-insensitive match).
 * @returns Atlas ID.
 */
export async function getAtlasByNetworkVersionAndShortName(
  network: string,
  version: string,
  shortName: string
): Promise<string> {
  const versionVariants = getVersionVariants(version);

  const result = await query(
    `SELECT id, overview->>'shortName' as short_name, overview->>'version' as version
       FROM hat.atlases 
       WHERE overview->>'network' = $1 
       AND overview->>'version' = ANY($2)
       AND LOWER(overview->>'shortName') = LOWER($3)`,
    [network, versionVariants, shortName]
  );

  if (result.rows.length === 0) {
    throw new Error(
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
 * Check that the specified file exists and has the specified atlas ID, throwing and error otherwise.
 * @param fileId - ID of the file to check.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmFileExistsOnAtlas(
  fileId: string,
  atlasId: string
): Promise<void> {
  const result = await query(
    `SELECT f.id FROM hat.files f
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
 * @param fileData.snsMessageId - SNS MessageId for deduplication
 * @param fileData.fileType - Type of file
 * @param fileData.integrityStatus - File integrity status
 * @param fileData.key - S3 object key
 * @param fileData.sha256Client - SHA256 hash from client
 * @param fileData.sizeBytes - File size in bytes
 * @param fileData.sourceDatasetId - Source dataset ID (if applicable)
 * @param fileData.status - File processing status
 * @param fileData.versionId - S3 object version ID
 * @param transaction - Database transaction to use
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
    key: string;
    sha256Client: string | null;
    sizeBytes: number;
    snsMessageId: string;
    sourceDatasetId: string | null;
    status: string;
    versionId: string | null;
  },
  transaction: pg.PoolClient
): Promise<{ etag: string; operation: string }> {
  const result = await transaction.query(
    `INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_dataset_id, component_atlas_id, sns_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, $11, $12, $13)
       
       -- ON CONFLICT: Handle duplicate SNS messages gracefully
       -- This triggers when sns_message_id already exists (proper SNS idempotency)
       ON CONFLICT (sns_message_id) 
       DO UPDATE SET 
         etag = files.etag,  -- Keep existing ETag (no change)
         event_info = files.event_info,
         is_latest = TRUE,
         updated_at = CURRENT_TIMESTAMP
       WHERE files.etag = EXCLUDED.etag
       RETURNING 
         (CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END) as operation,
         etag`,
    [
      fileData.bucket,
      fileData.key,
      fileData.versionId,
      fileData.etag,
      fileData.sizeBytes,
      fileData.eventInfo,
      fileData.sha256Client,
      fileData.integrityStatus,
      fileData.status,
      fileData.fileType,
      fileData.sourceDatasetId,
      fileData.componentAtlasId,
      fileData.snsMessageId,
    ]
  );

  // Check if the operation succeeded
  if (result.rows.length === 0) {
    // This happens when ON CONFLICT DO UPDATE WHERE condition fails
    // Meaning ETags don't match - potential data corruption
    throw new Error(
      `ETag mismatch detected for file ${fileData.bucket}/${fileData.key}. ` +
        `This indicates potential data corruption or conflicting S3 notifications.`
    );
  }

  return result.rows[0];
}
