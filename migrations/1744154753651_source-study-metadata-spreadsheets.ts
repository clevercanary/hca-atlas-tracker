import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.source_studies SET study_info=study_info||'{"metadataSpreadsheets":[]}'`
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.source_studies SET study_info=study_info-'metadataSpreadsheets'`
  );
}
