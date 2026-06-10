import pg from "pg";
import { HCAAtlasTrackerDBAtlasForMetadataCoverage } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "../services/database";

/**
 * Get every atlas along with the `metadata_coverage` blobs of its latest,
 * non-archived integrated object files. Atlases with no such files are included
 * with an empty array.
 * @param client - Optional database client for transaction support.
 * @returns one row per atlas, each with its files' metadata coverage blobs.
 */
export async function getAtlasComponentAtlasMetadataCoverage(
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlasForMetadataCoverage[]> {
  const { rows } = await query<HCAAtlasTrackerDBAtlasForMetadataCoverage>(
    `
      SELECT
        a.id,
        a.generation,
        a.revision,
        a.overview,
        COALESCE(
          ARRAY_AGG(f.metadata_coverage) FILTER (WHERE f.metadata_coverage IS NOT NULL),
          '{}'
        ) AS metadata_coverages
      FROM hat.atlases a
      LEFT JOIN hat.component_atlases e ON e.version_id = ANY(a.component_atlases)
      LEFT JOIN hat.files f
        ON f.id = e.file_id
        AND f.is_latest
        AND NOT f.is_archived
      GROUP BY a.id
    `,
    undefined,
    client,
  );
  return rows;
}

/**
 * Get every atlas along with the `metadata_coverage` blobs of its latest,
 * non-archived source dataset files. Atlases with no such files are included
 * with an empty array.
 * @param client - Optional database client for transaction support.
 * @returns one row per atlas, each with its files' metadata coverage blobs.
 */
export async function getAtlasSourceDatasetMetadataCoverage(
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlasForMetadataCoverage[]> {
  const { rows } = await query<HCAAtlasTrackerDBAtlasForMetadataCoverage>(
    `
      SELECT
        a.id,
        a.generation,
        a.revision,
        a.overview,
        COALESCE(
          ARRAY_AGG(f.metadata_coverage) FILTER (WHERE f.metadata_coverage IS NOT NULL),
          '{}'
        ) AS metadata_coverages
      FROM hat.atlases a
      LEFT JOIN hat.source_datasets e ON e.version_id = ANY(a.source_datasets)
      LEFT JOIN hat.files f
        ON f.id = e.file_id
        AND f.is_latest
        AND NOT f.is_archived
      GROUP BY a.id
    `,
    undefined,
    client,
  );
  return rows;
}
