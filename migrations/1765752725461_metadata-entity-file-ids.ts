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

  // Allow a file's metadata entity ID to be null, so that files can be inserted before corresponding metadata entities are
  // In the future, the metadata entity references will be dropped
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_exclusive_parent_relationship"
  );

  // Recreate foreign key constraints without onDelete setting the reference to null
  // (Note that the foreign key values could not in practice be set to null in that way, because the `ck_files_exclusive_parent_relationship` constraint would have prevented it)

  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id"
  );

  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id"
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    {
      foreignKeys: {
        columns: "component_atlas_id",
        onUpdate: "CASCADE",
        references: { name: "component_atlases", schema: "hat" },
      },
    }
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id",
    {
      foreignKeys: {
        columns: "source_dataset_id",
        onUpdate: "CASCADE",
        references: { name: "source_datasets", schema: "hat" },
      },
    }
  );
}

export function down(pgm: MigrationBuilder): void {
  // Update foreign key constraints

  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id"
  );

  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id"
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    {
      foreignKeys: {
        columns: "component_atlas_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        references: { name: "component_atlases", schema: "hat" },
      },
    }
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id",
    {
      foreignKeys: {
        columns: "source_dataset_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        references: { name: "source_datasets", schema: "hat" },
      },
    }
  );

  // Add constraint on null foreign keys

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "ck_files_exclusive_parent_relationship",
    {
      check: `(
        (file_type = 'source_dataset' AND source_dataset_id IS NOT NULL AND component_atlas_id IS NULL) OR
        (file_type = 'integrated_object' AND source_dataset_id IS NULL AND component_atlas_id IS NOT NULL) OR
        (file_type = 'ingest_manifest' AND source_dataset_id IS NULL AND component_atlas_id IS NULL)
      )`,
    }
  );

  // Remove file ID columns

  pgm.dropColumn({ name: "component_atlases", schema: "hat" }, "file_id");
  pgm.dropColumn({ name: "source_datasets", schema: "hat" }, "file_id");
}
