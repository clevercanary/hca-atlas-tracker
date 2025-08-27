import { NotFoundError } from "app/utils/api-handler";
import { query } from "./database";

/**
 * Check that the specified file exists and has the specified atlas ID, throwing and error otherwise.
 * @param fileId - ID of the file to check.
 * @param atlasId - ID of the atlas to check for.
 * @param fileTypeDescription - Wording to use to refer to the file in the error message.
 */
export async function confirmFileExistsOnAtlas(
  fileId: string,
  atlasId: string,
  fileTypeDescription = "File"
): Promise<void> {
  const result = await query(
    `SELECT 1 FROM hat.files f 
     WHERE f.id = $1 AND (
       -- Integrated object files via component atlas
       EXISTS(SELECT 1 FROM hat.component_atlases ca WHERE f.component_atlas_id = ca.id AND ca.atlas_id = $2)
       OR
       -- Source dataset files (with or without source study)
       f.source_dataset_id IS NOT NULL
     )`,
    [fileId, atlasId]
  );
  if (result.rows.length === 0)
    throw new NotFoundError(
      `${fileTypeDescription} with id ${fileId} doesn't exist on atlas with ID ${atlasId}`
    );
}
