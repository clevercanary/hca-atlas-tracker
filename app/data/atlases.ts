import pg from "pg";

/**
 * Update any atlases that contain a given existing component atlas version to instead contain a different given version.
 * @param existingVersionId - Existing component atlas version ID to replace.
 * @param newVersionId - New component atlas version ID to insert.
 * @param client - Postgres client to use.
 */
export async function updateComponentAtlasVersionInAtlases(
  existingVersionId: string,
  newVersionId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.atlases SET component_atlases = ARRAY_REPLACE(component_atlases, $1, $2)",
    [existingVersionId, newVersionId],
  );
}

/**
 * Update any atlases that contain a given existing source dataset version to instead contain a different given version.
 * @param existingVersionId - Existing source dataset version ID to replace.
 * @param newVersionId - New source dataset version ID to insert.
 * @param client - Postgres client to use.
 */
export async function updateSourceDatasetVersionInAtlases(
  existingVersionId: string,
  newVersionId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2)",
    [existingVersionId, newVersionId],
  );
}
