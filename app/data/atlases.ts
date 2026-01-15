import pg from "pg";

export async function updateComponentAtlasVersionInAtlases(
  existingVersionId: string,
  newVersionId: string,
  client: pg.PoolClient
): Promise<void> {
  await client.query(
    "UPDATE hat.atlases SET component_atlases = ARRAY_REPLACE(component_atlases, $1, $2)",
    [existingVersionId, newVersionId]
  );
}
