import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Get list of entry sheet IDs that appear on source studies, and delete entry sheet validations for sheets not in that list
  pgm.sql(
    `
      WITH study_sheets AS (
        SELECT jsonb_array_elements(s.study_info -> 'metadataSpreadsheets') ->> 'id' AS id
        FROM hat.source_studies s
      )
      DELETE FROM hat.entry_sheet_validations v
      WHERE NOT EXISTS(SELECT 1 FROM study_sheets WHERE study_sheets.id = v.entry_sheet_id)
    `,
  );
}

export function down(): void {}
