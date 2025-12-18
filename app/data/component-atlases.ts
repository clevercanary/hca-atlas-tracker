import pg from "pg";
import { FILE_TYPE } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { confirmFileIsOfType } from "./files";

/**
 * Set the associated file ID referenced by a component atlas.
 * @param componentAtlasId - Component atlas to update.
 * @param fileId - ID to set in the component atlas, referencing its file.
 * @param client - Postgres client to use.
 */
export async function setComponentAtlasFileId(
  componentAtlasId: string,
  fileId: string,
  client: pg.PoolClient
): Promise<void> {
  await confirmFileIsOfType(fileId, FILE_TYPE.INTEGRATED_OBJECT, client);
  const result = await client.query(
    "UPDATE hat.component_atlases SET file_id = $1 WHERE id = $2",
    [fileId, componentAtlasId]
  );
  if (result.rowCount === 0)
    throw new NotFoundError(
      `Component atlas with ID ${componentAtlasId} doesn't exist`
    );
}
