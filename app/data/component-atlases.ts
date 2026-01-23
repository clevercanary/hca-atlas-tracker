import pg from "pg";
import { HCAAtlasTrackerDBComponentAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";

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
      INSERT INTO hat.component_atlases (component_info, source_datasets, id, wip_number, file_id)
      SELECT component_info, source_datasets, id, wip_number + 1, $2
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
 * @param componentAtlasId - ID of the component atlas to update.
 * @param client - Postgres client to use.
 * @returns ID of the previously-latest component atlas version.
 */
export async function markComponentAtlasAsNotLatest(
  componentAtlasId: string,
  client: pg.PoolClient,
): Promise<string> {
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
  >(
    "UPDATE hat.component_atlases SET is_latest = FALSE WHERE id = $1 AND is_latest RETURNING version_id",
    [componentAtlasId],
  );
  if (queryResult.rows.length === 0)
    throw new Error(
      `No latest version found for component atlas ${componentAtlasId}`,
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
  client: pg.PoolClient
): Promise<void> {
  await client.query(
    "UPDATE hat.component_atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2) WHERE is_latest",
    [existingVersionId, newVersionId]
  );
}
