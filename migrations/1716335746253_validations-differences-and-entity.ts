import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `UPDATE hat.validations SET validation_info=validation_info||'{"differences":[],"relatedEntityUrl":null}'`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `UPDATE hat.validations SET validation_info=validation_info-'differences'-'relatedEntityUrl'`
  );
}
