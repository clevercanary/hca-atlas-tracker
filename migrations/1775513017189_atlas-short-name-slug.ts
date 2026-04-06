import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "atlases", schema: "hat" },
    {
      short_name_slug: {
        type: "text",
      },
    },
  );

  pgm.sql(
    "UPDATE hat.atlases SET short_name_slug = REPLACE(LOWER(overview->>'shortName'), ' ', '-')",
  );

  pgm.alterColumn({ name: "atlases", schema: "hat" }, "short_name_slug", {
    notNull: true,
  });

  pgm.addConstraint(
    { name: "atlases", schema: "hat" },
    "atlases_slug_version_unique",
    {
      unique: ["short_name_slug", "generation", "revision"],
    },
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "atlases", schema: "hat" },
    "atlases_slug_version_unique",
  );
  pgm.dropColumn({ name: "atlases", schema: "hat" }, "short_name_slug");
}
