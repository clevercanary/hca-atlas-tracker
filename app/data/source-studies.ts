import {
  GoogleSheetInfo,
  HCAAtlasTrackerDBSourceStudy,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import pg from "pg";

/**
 * Add a source study to an atlas's list of source studies.
 * @param sourceStudyId - Source study ID to add.
 * @param atlasId - Atlas to add the source study to.
 * @param client - Postgres client to use.
 * @returns boolean indicating whether the source study was already linked to the atlas.
 */
export async function linkSourceStudyToAtlas(
  sourceStudyId: string,
  atlasId: string,
  client: pg.PoolClient,
): Promise<boolean> {
  const queryResult = await client.query(
    "UPDATE hat.atlases SET source_studies=source_studies||$1 WHERE id=$2 AND NOT source_studies @> $1",
    [JSON.stringify([sourceStudyId]), atlasId],
  );

  return queryResult.rowCount === 0;
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
