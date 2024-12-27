import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.atlases SET status = (CASE WHEN status = 'Public' THEN 'COMPLETE' ELSE 'IN_PROGRESS' END)`
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.atlases SET status = (CASE WHEN status = 'COMPLETE' THEN 'Public' ELSE 'Draft' END)`
  );
}
