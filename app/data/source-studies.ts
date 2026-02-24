import pg from "pg";

/**
 * Add a source study to an atlas's list of source studies.
 * @param sourceStudyId - Source study ID to add.
 * @param atlasId - Atlas to add the source study to.
 * @param client - Postgres client to use.
 * @returns boolean indicating whether the source study was already linked to the atlas.
 */
export async function linkSourceStudyToAtlas(
  sourceStudyId: string,
  atlasId: string,
  client: pg.PoolClient,
): Promise<boolean> {
  const queryResult = await client.query(
    "UPDATE hat.atlases SET source_studies=source_studies||$1 WHERE id=$2 AND NOT source_studies @> $1",
    [JSON.stringify([sourceStudyId]), atlasId],
  );

  return queryResult.rowCount === 0;
}
