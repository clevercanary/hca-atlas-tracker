import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id"
  );
}

export function down(pgm: MigrationBuilder): void {
  // Add placeholder constraint so that duplicate titles won't cause issues but migrating back up is still possible
  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id",
    { check: "TRUE" }
  );
}
