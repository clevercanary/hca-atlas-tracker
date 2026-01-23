import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`UPDATE hat.atlases SET overview=overview||'{"description":""}'`);
  pgm.sql(
    `UPDATE hat.component_atlases SET component_info=component_info||'{"description":""}'`,
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(`UPDATE hat.atlases SET overview=overview-'description'`);
  pgm.sql(
    `UPDATE hat.component_atlases SET component_info=component_info-'description'`,
  );
}
