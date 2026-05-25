import pg from "pg";
import {
  GoogleSheetInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyWithSourceDatasets,
  WithLinkedAtlases,
} from "../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Get all source studies, under the initial database-level join with other entities needed for the global source studies API.
 * @param client - Postgres client to use.
 * @returns initial-join source studies for global API.
 */
export async function getInitialJoinSourceStudiesForGlobalApi(
  client: pg.PoolClient,
): Promise<
  WithLinkedAtlases<HCAAtlasTrackerDBSourceStudyWithSourceDatasets>[]
> {
  const queryResult = await client.query<
    WithLinkedAtlases<HCAAtlasTrackerDBSourceStudyWithSourceDatasets>
  >(
    `
      WITH atlases_with_revisions AS (
        SELECT
          ar.*,
          MAX(ar.revision) OVER (
            PARTITION BY ar.overview->>'network', ar.overview->>'shortName', ar.generation
          ) AS max_revision
        FROM hat.atlases ar
      ),
      source_dataset_counts AS (
        SELECT fd.source_study_id, COUNT(DISTINCT fd.id)::int AS source_dataset_count
        FROM hat.source_datasets fd
        JOIN hat.files f ON f.id = fd.file_id
        WHERE NOT f.is_archived
        GROUP BY fd.source_study_id
      ),
      study_atlases AS (
        SELECT
          s.id AS source_study_id,
          ARRAY_AGG(
            jsonb_build_object(
              'generation', a.generation,
              'id', a.id,
              'isPrimary', FALSE,
              'isLatest', a.revision = a.max_revision,
              'network', a.overview->>'network',
              'revision', a.revision,
              'shortName', a.overview->>'shortName'
            )
          ) AS atlases
        FROM hat.source_studies s
        JOIN atlases_with_revisions a ON a.source_studies ? s.id::text
        GROUP BY s.id
      )
      SELECT
        s.*,
        COALESCE(sdc.source_dataset_count, 0) AS source_dataset_count,
        sa.atlases
      FROM hat.source_studies s
      JOIN study_atlases sa ON sa.source_study_id = s.id
      LEFT JOIN source_dataset_counts sdc ON sdc.source_study_id = s.id
    `,
  );
  return queryResult.rows;
}

/**
 * Set the metadata spreadsheet list of a source study.
 * @param sourceStudyId - ID of source study to set metadata spreadsheets of.
 * @param metadataSpreadsheets - Metadata spreadsheet list to set.
 * @param client - Postgres client to use.
 */
export async function setSourceStudyMetadataSpreadsheets(
  sourceStudyId: string,
  metadataSpreadsheets: GoogleSheetInfo[],
  client: pg.PoolClient,
): Promise<void> {
  const studyInfoUpdate: Pick<
    HCAAtlasTrackerDBSourceStudy["study_info"],
    "metadataSpreadsheets"
  > = {
    metadataSpreadsheets,
  };
  await client.query(
    "UPDATE hat.source_studies SET study_info = study_info || $1 WHERE id = $2",
    [JSON.stringify(studyInfoUpdate), sourceStudyId],
  );
}
