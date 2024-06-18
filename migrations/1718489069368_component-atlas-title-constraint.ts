import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      title: {
        default: "",
        notNull: true,
        type: "text",
      },
    }
  );
  pgm.sql(
    "UPDATE hat.component_atlases SET title=component_info->>'title', component_info=component_info-'title'"
  );
  pgm.alterColumn({ name: "component_atlases", schema: "hat" }, "title", {
    default: null,
  });
  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id",
    {
      unique: [["title", "atlas_id"]],
    }
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "unique_component_atlases_title_atlas_id"
  );
  pgm.sql(
    "UPDATE hat.component_atlases SET component_info=component_info||jsonb_build_object('title', title)"
  );
  pgm.dropColumns({ name: "component_atlases", schema: "hat" }, ["title"]);
}
