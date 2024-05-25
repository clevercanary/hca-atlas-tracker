import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `UPDATE hat.atlases SET overview=jsonb_set(overview, '{integrationLead}', CASE WHEN overview->'integrationLead'='null' THEN '[]' ELSE jsonb_build_array(overview->'integrationLead') END)`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `UPDATE hat.atlases SET overview=jsonb_set(overview, '{integrationLead}', COALESCE(overview->'integrationLead'->0, 'null'))`
  );
}
