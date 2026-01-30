import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Drop component atlas ID constraint from files
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
  );

  // Rename component atlas `id` to `version_id`, as we want `version_id` to be the primary key
  pgm.renameColumn(
    { name: "component_atlases", schema: "hat" },
    "id",
    "version_id",
  );

  // Add new component atlas columns needed for versioning
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      is_latest: {
        default: true,
        notNull: true,
        type: "boolean",
      },
      wip_number: {
        default: 1,
        notNull: true,
        type: "integer",
      },
    },
  );

  // For existing component atlases, we want `id` to be the same as the existing ID now stored in `version_id`,
  // to make sure references are straightforwardly kept intact
  pgm.sql("UPDATE hat.component_atlases SET id = version_id");

  // Create component atlases for non-latest file versions
  pgm.sql(`
    INSERT INTO hat.component_atlases (id, version_id, component_info, source_datasets, is_latest, file_id, wip_number, created_at, updated_at)
    SELECT
      ca.id,
      gen_random_uuid() AS version_id,
      ca.component_info,
      ca.source_datasets,
      false AS is_latest,
      f.id AS file_id,
      ROW_NUMBER() OVER (PARTITION BY f.component_atlas_id ORDER BY f.created_at) AS wip_number,
      f.created_at,
      ca.updated_at
    FROM hat.files f
    JOIN hat.component_atlases ca ON ca.version_id = f.component_atlas_id
    WHERE f.component_atlas_id IS NOT NULL
      AND f.is_latest = false
  `);

  // Set accurate WIP numbers for latest (i.e. preexisting) component atlases
  pgm.sql(`
    WITH files_info AS (
      SELECT
        component_atlas_id,
        COUNT(*) AS file_count
      FROM hat.files
      WHERE component_atlas_id IS NOT NULL
      GROUP BY component_atlas_id
    )
    UPDATE hat.component_atlases ca
    SET wip_number = f.file_count
    FROM files_info AS f
    WHERE ca.version_id = f.component_atlas_id
  `);

  // Drop the `component_atlas_id` column and its index
  pgm.dropIndex({ name: "files", schema: "hat" }, "component_atlas_id");
  pgm.dropColumn({ name: "files", schema: "hat" }, "component_atlas_id");

  // `is_latest` is retained because it's still needed for source dataset files
}

export function down(pgm: MigrationBuilder): void {
  // Re-add the columns to files table
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      component_atlas_id: {
        type: "uuid",
      },
    },
  );

  // Re-create the index
  pgm.createIndex({ name: "files", schema: "hat" }, ["component_atlas_id"]);

  // Populate component_atlas_id and is_latest in files from component_atlases
  pgm.sql(`
    UPDATE hat.files f
    SET
      component_atlas_id = ca.id,
      is_latest = ca.is_latest
    FROM hat.component_atlases ca
    WHERE f.id = ca.file_id
  `);

  // Delete non-latest component atlases (keeping only the original ones)
  pgm.sql(`
    DELETE FROM hat.component_atlases
    WHERE is_latest = false
  `);

  // Copy `id` to `version_id` before replacing `id` with `version_id`
  pgm.sql("UPDATE hat.component_atlases SET version_id = id");

  // Drop the new columns from component_atlases
  pgm.dropColumns({ name: "component_atlases", schema: "hat" }, [
    "id",
    "is_latest",
    "wip_number",
  ]);

  // Rename version_id back to id
  pgm.renameColumn(
    { name: "component_atlases", schema: "hat" },
    "version_id",
    "id",
  );

  // Re-add the foreign key constraint
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    {
      foreignKeys: {
        columns: "component_atlas_id",
        onUpdate: "CASCADE",
        references: { name: "component_atlases", schema: "hat" },
      },
    },
  );
}
