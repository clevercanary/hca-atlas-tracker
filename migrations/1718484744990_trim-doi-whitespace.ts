import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    "UPDATE hat.source_studies SET doi=regexp_replace(doi, '^\\s+|\\s+$', '', 'g') WHERE NOT doi IS NULL"
  );
  pgm.sql(
    "UPDATE hat.validations SET validation_info=validation_info||jsonb_build_object('doi', regexp_replace(validation_info->>'doi', '^\\s+|\\s+$', '', 'g')) WHERE NOT validation_info->'doi'='null'"
  );
}

export const down = (): void => undefined;
