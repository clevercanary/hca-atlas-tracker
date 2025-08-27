import { NotFoundError } from "app/utils/api-handler";
import { query } from "../services/database";

/**
 * Generate version variants for flexible matching.
 * @param version - Original version string.
 * @returns Array of version variants to match against.
 */
function getVersionVariants(version: string): string[] {
  const versionWithoutDecimal = version.replace(".0", "");
  const versionWithDecimal = version.includes(".") ? version : `${version}.0`;

  // Return unique variants
  return [...new Set([version, versionWithoutDecimal, versionWithDecimal])];
}

/**
 * Get atlas ID by network, version, and short name with flexible version matching.
 * @param network - Atlas network.
 * @param version - Atlas version (supports flexible matching like "1" vs "1.0").
 * @param shortName - Atlas short name (case-insensitive match).
 * @returns Atlas ID.
 */
export async function getAtlasByNetworkVersionAndShortName(
  network: string,
  version: string,
  shortName: string
): Promise<string> {
  const versionVariants = getVersionVariants(version);

  const result = await query(
    `SELECT id, overview->>'shortName' as short_name, overview->>'version' as version
       FROM hat.atlases 
       WHERE overview->>'network' = $1 
       AND overview->>'version' = ANY($2)
       AND LOWER(overview->>'shortName') = LOWER($3)`,
    [network, versionVariants, shortName]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `Atlas not found for network: ${network}, shortName: ${shortName}, version: ${version}`
    );
  }

  if (result.rows.length > 1) {
    throw new Error(
      `Multiple atlases found for network: ${network}, shortName: ${shortName}, version: ${version}. Found ${result.rows.length} matches.`
    );
  }

  return result.rows[0].id;
}

/**
 * Check that the specified file exists and has the specified atlas ID, throwing and error otherwise.
 * @param fileId - ID of the file to check.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmFileExistsOnAtlas(
  fileId: string,
  atlasId: string
): Promise<void> {
  const result = await query(
    `SELECT f.id FROM hat.files f
       WHERE f.id = $1
       AND (
         -- Integrated object files via component atlas
         EXISTS (
           SELECT 1 FROM hat.component_atlases ca 
           WHERE f.component_atlas_id = ca.id AND ca.atlas_id = $2
         )
         OR
         -- Source dataset files (with or without source study)
         f.source_dataset_id IS NOT NULL
       )`,
    [fileId, atlasId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError(
      `File with id ${fileId} doesn't exist on the specified atlas.`
    );
  }
}
