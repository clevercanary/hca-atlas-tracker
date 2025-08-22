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
    "SELECT 1 FROM hat.files WHERE id=$1 AND atlas_id=$2",
    [fileId, atlasId]
  );
  if (result.rows.length === 0)
    throw new NotFoundError(
      `${fileTypeDescription} with id ${fileId} doesn't exist on atlas with ID ${atlasId}`
    );
}
