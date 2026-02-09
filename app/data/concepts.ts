import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBConcept,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "app/utils/api-handler";

// TODO: separate into service layer

/**
 * Get an existing concept ID if it exists, or create a new concept otherwise.
 * @param info - Values with which to look up or create a concept.
 * @param info.atlas_short_name - Lowercase atlas short name.
 * @param info.base_filename - File name.
 * @param info.file_type - File type.
 * @param info.generation - Atlas generation.
 * @param info.network - Atlas network.
 * @param client - Postgres client to use.
 * @returns concept ID.
 */
export async function getOrCreateConceptId(
  info: Pick<
    HCAAtlasTrackerDBConcept,
    | "atlas_short_name"
    | "base_filename"
    | "file_type"
    | "generation"
    | "network"
  >,
  client: pg.PoolClient,
): Promise<string> {
  const selectResult = await client.query<Pick<HCAAtlasTrackerDBConcept, "id">>(
    `
      SELECT id FROM hat.concepts
      WHERE atlas_short_name = $1
        AND base_filename = $2
        AND file_type = $3
        AND generation = $4
        AND network = $5
    `,
    [
      info.atlas_short_name,
      info.base_filename,
      info.file_type,
      info.generation,
      info.network,
    ],
  );

  if (selectResult.rows.length > 0) return selectResult.rows[0].id;

  const insertResult = await client.query<Pick<HCAAtlasTrackerDBConcept, "id">>(
    `
      INSERT INTO hat.concepts (atlas_short_name, base_filename, file_type, generation, network)
      VALUES ($1, $2, $3, $4, $5)
      
      ON CONFLICT (atlas_short_name, base_filename, file_type, generation, network)
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP

      RETURNING id
    `,
    [
      info.atlas_short_name,
      info.base_filename,
      info.file_type,
      info.generation,
      info.network,
    ],
  );

  return insertResult.rows[0].id;
}

/**
 * Get the atlas with metadata matching the given concept.
 * @param conceptId - Concept ID.
 * @param client - Postgres client to use.
 * @returns matching atlas.
 */
export async function getAtlasMatchingConcept(
  conceptId: string,
  client: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlas> {
  const queryResult = await client.query<HCAAtlasTrackerDBAtlas>(
    `
      SELECT a.id
      FROM hat.atlases a
      JOIN hat.concepts c ON
        a.overview->>'network' = c.network
        AND lower(a.overview->>'shortName') = c.atlas_short_name
        AND split_part(a.overview->>'version', '.', 1)::int = c.generation
      WHERE c.id = $1
    `,
    [conceptId],
  );

  if (queryResult.rows.length === 0) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    throw new NotFoundError(
      `No atlas found matching concept ${conceptId} (${atlasInfo})`,
    );
  }

  if (queryResult.rows.length > 1) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    throw new Error(
      `Multiple atlases found matching concept ${conceptId} (${atlasInfo})`,
    );
  }

  return queryResult.rows[0];
}

async function getConceptAtlasInfoString(
  conceptId: string,
  client: pg.PoolClient,
): Promise<string> {
  const queryResult = await client.query<HCAAtlasTrackerDBConcept>(
    "SELECT * FROM hat.concepts WHERE id = $1",
    [conceptId],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Concept with ID ${conceptId} does not exist`);
  const concept = queryResult.rows[0];
  return `${concept.atlas_short_name} v${concept.generation} in ${concept.network} network`;
}
