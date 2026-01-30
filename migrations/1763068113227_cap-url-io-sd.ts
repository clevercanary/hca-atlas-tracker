import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.component_atlases SET component_info=component_info||'{"capUrl": null}'`,
  );
  pgm.sql(`UPDATE hat.source_datasets SET sd_info=sd_info||'{"capUrl": null}'`);
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.component_atlases SET component_info=component_info-'capUrl'`,
  );
  pgm.sql(`UPDATE hat.source_datasets SET sd_info=sd_info-'capUrl'`);
}
