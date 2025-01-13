import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`UPDATE hat.atlases SET overview=overview||'{"tasksBySystem": []}'`);
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(`UPDATE hat.atlases SET overview=overview-'tasksBySystem'`);
}
