import { HCAAtlasTrackerDBAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "../services/database";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { AtlasNameAndVersion } from "../utils/atlases";
import pg from "pg";

/**
 * Get an atlas ID based on a case-insensitive short name, a generation number, and a revision number.
 * @param nameAndVersion - Atlas name and version numbers.
 * @param nameAndVersion.shortName - Atlas short name.
 * @param nameAndVersion.generation - Atlas generation.
 * @param nameAndVersion.revision - Atlas revision.
 * @returns atlas ID.
 */
export async function getAtlasIdByNameAndVersion({
  generation,
  revision,
  shortName,
}: AtlasNameAndVersion): Promise<string> {
  const lowerShortName = shortName.toLowerCase();
  const queryResult = await query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE LOWER(overview->>'shortName') = $1 AND generation = $2 AND revision = $3",
    [lowerShortName, generation, revision],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Atlas ${shortName} v${generation}.${revision} doesn't exist`,
    );
  if (queryResult.rows.length > 1)
    throw new Error(
      `Found multiple atlases named ${shortName} v${generation}.${revision}`,
    );
  return queryResult.rows[0].id;
}

/**
 * Replace a source study ID with another specified source study ID across all atlas source study lists.
 * @param currentSourceStudyId - Source study ID to replace.
 * @param replacementSourceStudyId - Source study ID to insert.
 * @param client - Postgres client to use.
 */
export async function replaceSourceStudyInAtlases(
  currentSourceStudyId: string,
  replacementSourceStudyId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    `
      UPDATE hat.atlases
      -- Remove both source studies to ensure a clean slate, and then re-add the replacement one
      SET source_studies = (source_studies - $1 - $2) || jsonb_build_array($2::text)
      WHERE source_studies ? $1
    `,
    [currentSourceStudyId, replacementSourceStudyId],
  );
}

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
 * Get an atlas's published-at value.
 * @param atlasId - Atlas ID.
 * @returns published-at value.
 */
export async function getAtlasPublishedAt(
  atlasId: string,
): Promise<Date | null> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBAtlas, "published_at">>(
    "SELECT published_at FROM hat.atlases WHERE id = $1",
    [atlasId],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  return queryResult.rows[0].published_at;
}

/**
 * Set a currently-unpublished atlas's published-at date, erroring if the atlas is already published.
 * @param atlasId - Atlas ID.
 * @param publishedAt - Publish date to set.
 * @param client - Postgres client to use.
 */
export async function changeAtlasToPublished(
  atlasId: string,
  publishedAt: Date,
  client: pg.PoolClient,
): Promise<void> {
  const queryResult = await client.query(
    "UPDATE hat.atlases SET published_at = $2 WHERE id = $1 AND published_at IS NULL",
    [atlasId, publishedAt],
  );
  if (queryResult.rowCount === 0)
    throw new InvalidOperationError(
      `Atlas with ID ${atlasId} is already published`,
    );
}
