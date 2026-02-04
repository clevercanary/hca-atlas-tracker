import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "atlases", schema: "hat" },
    {
      component_atlases: {
        default: "{}",
        notNull: true,
        type: "uuid[]",
      },
    },
  );

  pgm.sql(
    `
      UPDATE hat.atlases a
      SET component_atlases = (
        SELECT COALESCE(array_agg(c.id), '{}') FROM hat.component_atlases c WHERE c.atlas_id=a.id
      )
    `,
  );

  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "pk_component_atlases_atlas_id",
  );

  pgm.dropColumn({ name: "component_atlases", schema: "hat" }, "atlas_id");
}

export function down(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      atlas_id: {
        notNull: false, // Different from the original column, in order to support component atlas rows that may not be referenced by any atlas; this could theoretically lead to orphaned component atlases in the case of a down migration
        type: "uuid",
      },
    },
  );

  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "pk_component_atlases_atlas_id",
    {
      foreignKeys: {
        columns: "atlas_id",
        references: { name: "atlases", schema: "hat" },
      },
    },
  );

  pgm.sql(
    `
      UPDATE hat.component_atlases c
      SET atlas_id = (
        SELECT a.id FROM hat.atlases a WHERE c.id = ANY(a.component_atlases) LIMIT 1
      )
    `,
  );

  pgm.dropColumn({ name: "atlases", schema: "hat" }, "component_atlases");
}
