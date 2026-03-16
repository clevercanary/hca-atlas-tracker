import pg from "pg";

/**
 * Update all entry sheet validations linked to a given source study to be linked to another given source study instead.
 * @param currentSourceStudyId - Source study ID to replace.
 * @param replacementSourceStudyId - New source study ID to set.
 * @param client - Postgres client to use.
 */
export async function replaceEntrySheetValidationsSourceStudy(
  currentSourceStudyId: string,
  replacementSourceStudyId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    "UPDATE hat.entry_sheet_validations SET source_study_id = $1 WHERE source_study_id = $2",
    [replacementSourceStudyId, currentSourceStudyId],
  );
}
