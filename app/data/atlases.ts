import { query } from "../services/database";

export async function updateComponentAtlasVersionInAtlases(
  existingVersionId: string,
  newVersionId: string
): Promise<void> {
  await query(
    "UPDATE hat.atlases SET component_atlases = ARRAY_REPLACE(component_atlases, $1, $2)",
    [existingVersionId, newVersionId]
  );
}
