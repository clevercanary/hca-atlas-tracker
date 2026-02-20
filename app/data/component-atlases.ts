import pg from "pg";
import { HCAAtlasTrackerDBComponentAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "../services/database";
import { NotFoundError } from "../utils/api-handler";

/**
 * Create a new latest component atlas version based on the given existing version.
 * @param prevVersionId - ID of the previous version of the component atlas.
 * @param fileId - ID of the new version's file.
 * @param client - Postgres client to use.
 * @returns new component atlas version ID.
 */
export async function createNewComponentAtlasVersion(
  prevVersionId: string,
  fileId: string,
  client: pg.PoolClient,
): Promise<string> {
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
  >(
    `
      INSERT INTO hat.component_atlases (component_info, source_datasets, id, wip_number, file_id, revision)
      SELECT component_info, source_datasets, id, wip_number + 1, $2, revision
      FROM hat.component_atlases
      WHERE version_id = $1
      RETURNING version_id
    `,
    [prevVersionId, fileId],
  );
  return queryResult.rows[0].version_id;
}

/**
 * Mark the existing latest version of the given component atlas as not latest.
 * @param conceptId - Concept ID of the component atlas to update.
 * @param client - Postgres client to use.
 * @returns ID of the previously-latest component atlas version.
 */
export async function markComponentAtlasAsNotLatest(
  conceptId: string,
  client: pg.PoolClient,
): Promise<string> {
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
  >(
    "UPDATE hat.component_atlases SET is_latest = FALSE WHERE id = $1 AND is_latest RETURNING version_id",
    [conceptId],
  );
  if (queryResult.rows.length === 0)
    throw new Error(
      `No latest version found for component atlas of concept ${conceptId}`,
    );
  return queryResult.rows[0].version_id;
}

/**
 * Update any latest-version component atlases that contain a given existing source dataset version to instead contain a different given version.
 * @param existingVersionId - Existing source dataset version ID to replace.
 * @param newVersionId - New source dataset version ID to insert.
 * @param client - Postgres client to use.
 */
export async function updateSourceDatasetVersionInComponentAtlases(
  existingVersionId: string,
  newVersionId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.component_atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2) WHERE is_latest",
    [existingVersionId, newVersionId],
  );
}

/**
 * Get the component atlas of the given atlas that's associated with the given file.
 * @param atlasId - Atlas to get component atlas for.
 * @param fileId - File ID of the component atlas to get.
 * @returns component atlas.
 */
export async function getComponentAtlasForAtlasFile(
  atlasId: string,
  fileId: string,
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "SELECT c.* FROM hat.component_atlases c JOIN hat.atlases a ON c.version_id = ANY(a.component_atlases) WHERE a.id = $1 AND c.file_id = $2",
    [atlasId, fileId],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Integrated object file with ID ${fileId} does not exist on atlas with ID ${atlasId}`,
    );
  return queryResult.rows[0];
}
