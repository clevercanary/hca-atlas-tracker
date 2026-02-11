import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBConcept,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "app/utils/api-handler";

/**
 * Get the ID of the concept matching the given info, if it exists.
 * @param info - Identifying info to look up a concept by.
 * @param client - Postgres client to use.
 * @returns concept ID, or null if no matching concept exists.
 */
export async function getConceptIdByInfo(
  info: Pick<
    HCAAtlasTrackerDBConcept,
    | "atlas_short_name"
    | "base_filename"
    | "file_type"
    | "generation"
    | "network"
  >,
  client: pg.PoolClient,
): Promise<string | null> {
  const queryResult = await client.query<Pick<HCAAtlasTrackerDBConcept, "id">>(
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

  return queryResult.rows.length > 0 ? queryResult.rows[0].id : null;
}

/**
 * Create a new concept.
 * @param info - Info to populate the new concept with.
 * @param client - Postgres client to use.
 * @returns new concept ID.
 */
export async function createConcept(
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
  const queryResult = await client.query<Pick<HCAAtlasTrackerDBConcept, "id">>(
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

  return queryResult.rows[0].id;
}

/**
 * Get all atlases matching the given concept.
 * @param conceptId - ID of concept to get atlases for.
 * @param client - Postgres client to use.
 * @returns array of matching atlases.
 * @note In theory, this will always return one atlas -- further handling is needed for error detection.
 */
export async function getAtlasesMatchingConcept(
  conceptId: string,
  client: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlas[]> {
  return (
    await client.query<HCAAtlasTrackerDBAtlas>(
      `
      SELECT a.*
      FROM hat.atlases a
      JOIN hat.concepts c ON
        a.overview->>'network' = c.network
        AND lower(a.overview->>'shortName') = c.atlas_short_name
        AND split_part(a.overview->>'version', '.', 1)::int = c.generation
      WHERE c.id = $1
    `,
      [conceptId],
    )
  ).rows;
}

/**
 * Get a concept by ID.
 * @param conceptId - ID of concept to get.
 * @param client - Postgres client to use.
 * @returns concept.
 */
export async function getConcept(
  conceptId: string,
  client: pg.PoolClient,
): Promise<HCAAtlasTrackerDBConcept> {
  const queryResult = await client.query<HCAAtlasTrackerDBConcept>(
    "SELECT * FROM hat.concepts WHERE id = $1",
    [conceptId],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Concept with ID ${conceptId} does not exist`);
  return queryResult.rows[0];
}
