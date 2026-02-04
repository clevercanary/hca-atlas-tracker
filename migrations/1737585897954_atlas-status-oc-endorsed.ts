import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.atlases SET status = (CASE WHEN status = 'COMPLETE' THEN 'OC_ENDORSED' ELSE status END)`,
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.atlases SET status = (CASE WHEN status = 'OC_ENDORSED' THEN 'COMPLETE' ELSE status END)`,
  );
}
