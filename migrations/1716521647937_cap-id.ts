import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`UPDATE hat.source_datasets SET sd_info=sd_info||'{"capId":null}'`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`UPDATE hat.source_datasets SET sd_info=sd_info-'capId'`);
}
