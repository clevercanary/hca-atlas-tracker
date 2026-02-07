import pg from "pg";

export interface ConceptData {
  atlasShortName: string;
  baseFilename: string;
  fileType: string;
  generation: number;
  network: string;
}

/**
 * Find an existing concept or create a new one based on the unique tuple.
 * Uses INSERT ... ON CONFLICT to atomically find-or-create.
 * @param data - Concept identifying fields.
 * @param client - Postgres client (transaction).
 * @returns The concept's UUID.
 */
export async function findOrCreateConcept(
  data: ConceptData,
  client: pg.PoolClient,
): Promise<string> {
  // Attempt insert; on conflict (concept already exists), do nothing
  const result = await client.query<{ id: string }>(
    `
      WITH new_concept AS (
        INSERT INTO hat.concepts (atlas_short_name, network, generation, base_filename, file_type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (atlas_short_name, network, generation, base_filename, file_type)
        DO NOTHING
        RETURNING id
      )
      SELECT id FROM new_concept
      UNION ALL
      SELECT id FROM hat.concepts
      WHERE atlas_short_name = $1 AND network = $2 AND generation = $3 AND base_filename = $4 AND file_type = $5
      LIMIT 1
    `,
    [
      data.atlasShortName,
      data.network,
      data.generation,
      data.baseFilename,
      data.fileType,
    ],
  );

  return result.rows[0].id;
}
