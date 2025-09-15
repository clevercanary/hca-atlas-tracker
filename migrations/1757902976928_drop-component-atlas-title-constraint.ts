import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id"
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id",
    { check: "TRUE" }
  );
}
