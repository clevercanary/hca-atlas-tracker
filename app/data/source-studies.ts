import pg from "pg";
import {
  GoogleSheetInfo,
  HCAAtlasTrackerDBSourceStudy,
} from "../apis/catalog/hca-atlas-tracker/common/entities";

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
