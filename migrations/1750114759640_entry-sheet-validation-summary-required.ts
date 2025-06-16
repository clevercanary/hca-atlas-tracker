import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.entry_sheet_validations
    SET validation_summary='{"dataset_count": null, "donor_count": null, "error_count": 1, "sample_count": null}'
    WHERE validation_summary IS NULL
  `);
  pgm.alterColumn(
    { name: "entry_sheet_validations", schema: "hat" },
    "validation_summary",
    { notNull: true }
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.alterColumn(
    { name: "entry_sheet_validations", schema: "hat" },
    "validation_summary",
    { notNull: false }
  );
  pgm.sql(
    "UPDATE hat.entry_sheet_validations SET validation_summary=NULL WHERE validation_summary->'dataset_count'='null'"
  );
}
