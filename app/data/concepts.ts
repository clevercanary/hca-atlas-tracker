import { PoolClient } from "pg";
import {
  FILE_TYPE,
  HCAAtlasTrackerDBConcept,
  NetworkKey,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { stripVersionSuffix } from "../utils/filename";

/**
 * Find or create a concept by its unique attributes
 * @param atlasShortName - Atlas short name
 * @param network - Network key
 * @param generation - Generation number (first part of version)
 * @param baseFilename - Filename with version suffix stripped
 * @param fileType - File type (source_dataset or integrated_object)
 * @param transaction - Database transaction client
 * @returns The concept ID
 */
export async function findOrCreateConcept(
  atlasShortName: string,
  network: NetworkKey,
  generation: number,
  baseFilename: string,
  fileType: FILE_TYPE,
  transaction: PoolClient,
): Promise<string> {
  // Try to find existing concept
  const findResult = await transaction.query<{ id: string }>(
    `SELECT id FROM hat.concepts
     WHERE atlas_short_name = $1
       AND network = $2
       AND generation = $3
       AND base_filename = $4
       AND file_type = $5`,
    [atlasShortName, network, generation, baseFilename, fileType],
  );

  if (findResult.rows.length > 0) {
    return findResult.rows[0].id;
  }

  // Create new concept if not found
  const insertResult = await transaction.query<{ id: string }>(
    `INSERT INTO hat.concepts (atlas_short_name, network, generation, base_filename, file_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [atlasShortName, network, generation, baseFilename, fileType],
  );

  return insertResult.rows[0].id;
}

/**
 * Get or create concept ID for a file based on S3 path and metadata
 * @param filename - The filename from S3 key
 * @param atlasShortName - Atlas short name
 * @param network - Network key
 * @param atlasVersion - Full atlas version (e.g., "1.0", "2.1")
 * @param fileType - File type (source_dataset or integrated_object)
 * @param transaction - Database transaction client
 * @returns The concept ID
 */
export async function getConceptIdForFile(
  filename: string,
  atlasShortName: string,
  network: NetworkKey,
  atlasVersion: string,
  fileType: FILE_TYPE,
  transaction: PoolClient,
): Promise<string> {
  // Strip version suffix from filename to get base filename
  const baseFilename = stripVersionSuffix(filename);

  // Extract generation from version (e.g., "1.0" -> 1, "2.1" -> 2)
  const generation = parseInt(atlasVersion.split(".")[0], 10);

  // Find or create concept
  return await findOrCreateConcept(
    atlasShortName,
    network,
    generation,
    baseFilename,
    fileType,
    transaction,
  );
}

/**
 * Get concept by ID
 * @param conceptId - The concept ID
 * @param transaction - Database transaction client
 * @returns The concept record or null if not found
 */
export async function getConceptById(
  conceptId: string,
  transaction: PoolClient,
): Promise<HCAAtlasTrackerDBConcept | null> {
  const result = await transaction.query<HCAAtlasTrackerDBConcept>(
    `SELECT * FROM hat.concepts WHERE id = $1`,
    [conceptId],
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}
