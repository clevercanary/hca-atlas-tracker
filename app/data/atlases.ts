import pg from "pg";

/**
 * Update an atlas containing a given existing component atlas version to instead contain a different given version.
 * @param existingVersionId - Existing component atlas version ID to replace.
 * @param newVersionId - New component atlas version ID to insert.
 * @param atlasId - ID of the atlas to replace the component atlas in.
 * @param client - Postgres client to use.
 */
export async function updateComponentAtlasVersionInAtlas(
  existingVersionId: string,
  newVersionId: string,
  atlasId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.atlases SET component_atlases = ARRAY_REPLACE(component_atlases, $1, $2) WHERE id = $3",
    [existingVersionId, newVersionId, atlasId],
  );
}

/**
 * Update an atlas containing a given existing source dataset version to instead contain a different given version.
 * @param existingVersionId - Existing source dataset version ID to replace.
 * @param newVersionId - New source dataset version ID to insert.
 * @param atlasId - ID of the atlas to replace the source dataset in.
 * @param client - Postgres client to use.
 */
export async function updateSourceDatasetVersionInAtlas(
  existingVersionId: string,
  newVersionId: string,
  atlasId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2) WHERE id = $3",
    [existingVersionId, newVersionId, atlasId],
  );
}

/**
 * Set an atlas's published-at date.
 * @param atlasId - Atlas ID.
 * @param publishedAt - Publish date to set.
 * @param client - Postgres client to use.
 */
export async function setAtlasPublishedAt(
  atlasId: string,
  publishedAt: Date,
  client: pg.PoolClient,
): Promise<void> {
  await client.query("UPDATE hat.atlases SET published_at = $2 WHERE id = $1", [
    atlasId,
    publishedAt,
  ]);
}
