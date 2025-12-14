import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      file_id: {
        references: { name: "files", schema: "hat" },
        type: "uuid",
      },
    }
  );

  pgm.addColumns(
    { name: "source_datasets", schema: "hat" },
    {
      file_id: {
        references: { name: "files", schema: "hat" },
        type: "uuid",
      },
    }
  );

  pgm.sql(
    `
      UPDATE hat.component_atlases c
      SET file_id = f.id
      FROM hat.files f
      WHERE f.is_latest AND f.component_atlas_id = c.id
    `
  );

  pgm.sql(
    `
      UPDATE hat.source_datasets c
      SET file_id = f.id
      FROM hat.files f
      WHERE f.is_latest AND f.source_dataset_id = c.id
    `
  );

  // Note: setting notNull here requires that any old metadata entities from before the files table existed have been deleted

  pgm.alterColumn({ name: "component_atlases", schema: "hat" }, "file_id", {
    notNull: true,
  });

  pgm.alterColumn({ name: "source_datasets", schema: "hat" }, "file_id", {
    notNull: true,
  });
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropColumn({ name: "component_atlases", schema: "hat" }, "file_id");
  pgm.dropColumn({ name: "source_datasets", schema: "hat" }, "file_id");
}
