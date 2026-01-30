import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.source_datasets SET sd_info=sd_info||'{"metadataSpreadsheetTitle":null}'`,
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.source_datasets SET sd_info=sd_info-'metadataSpreadsheetTitle'`,
  );
}
